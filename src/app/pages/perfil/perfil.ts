import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { UsuarioService } from '../../core/service/usuario.service';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from '../../core/service/session.service';
import { SuscripcionRedirectService } from '../../core/service/suscripcion-redirect.service';
import { UsuarioResponse, ActualizarPerfilRequest, CambiarPasswordRequest } from '../../core/models/interfaces';

@Component({
  selector: 'app-perfil',
  imports: [DatePipe, FormsModule, Navbar, Footer, SessionTimeoutModal],
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit, OnDestroy {
  usuario = signal<UsuarioResponse | null>(null);
  loading = signal(true);
  showEditModal = signal(false);
  savingEdit = signal(false);
  editError = signal('');
  editForm: ActualizarPerfilRequest = { nombre: '', apellido: '', telefono: '', username: '' };

  showPasswordModal = signal(false);
  savingPassword = signal(false);
  passwordError = signal('');
  passwordSuccess = signal('');
  passwordForm: CambiarPasswordRequest = { contrasenaActual: '', nuevaPassword: '', confirmarPassword: '' };

  prueba2MinLoading = signal(false);
  twoFactorLoading = signal(false);

  /** Segundos restantes cuando < 1 min (countdown). null = no en modo countdown. */
  segundosRestantes = signal<number | null>(null);
  /** True cuando el countdown llegó a 0 en el cliente (antes de refrescar). */
  suscripcionExpiradaEnCliente = signal(false);
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  /** 2FA activa: true cuando el usuario la tiene habilitada (null se considera activa). */
  twoFactorActiva = computed(() => this.usuario()?.twoFactorActivo !== false);

  /** Suscripción activa efectiva: false si expiramos en cliente o backend dice expirada. */
  suscripcionActivaEfectiva = computed(() => {
    const u = this.usuario();
    if (!u || u.rol === 'ADMIN') return true;
    if (this.suscripcionExpiradaEnCliente()) return false;
    return u.suscripcionActiva;
  });

  constructor(
    private usuarioService: UsuarioService,
    protected authService: AuthService,
    private sessionService: SessionService,
    private suscripcionRedirect: SuscripcionRedirectService
  ) {}

  mostrarSuscripcionVencida = signal(false);

  ngOnInit(): void {
    this.sessionService.startMonitoring(false);
    this.mostrarSuscripcionVencida.set(this.suscripcionRedirect.consumirRedirectPorVencida());
    this.cargarPerfil();
  }

  ngOnDestroy(): void {
    this.sessionService.stopMonitoring();
    this.detenerCountdown();
  }

  private detenerCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.segundosRestantes.set(null);
  }

  private iniciarCountdownSiCorresponde(): void {
    this.detenerCountdown();
    this.suscripcionExpiradaEnCliente.set(false);
    const user = this.usuario();
    if (!user?.suscripcionActiva || !user.finSuscripcionAt) return;
    const fin = new Date(user.finSuscripcionAt);
    const tick = () => {
      const ahora = new Date();
      const diffMs = fin.getTime() - ahora.getTime();
      if (diffMs <= 0) {
        this.detenerCountdown();
        this.suscripcionExpiradaEnCliente.set(true);
        this.cargarPerfil();
        return;
      }
      const segundos = Math.floor(diffMs / 1000);
      if (segundos <= 60) {
        this.segundosRestantes.set(segundos);
      } else {
        this.segundosRestantes.set(null);
      }
    };
    tick();
    this.countdownInterval = setInterval(tick, 1000);
  }

  cargarPerfil(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (data) => {
        this.usuario.set(data);
        this.loading.set(false);
        this.iniciarCountdownSiCorresponde();
      },
      error: () => this.loading.set(false),
    });
  }

  logout(): void {
    this.authService.logout();
  }

  /** Texto de tiempo restante: "X minutos" o "X días" según corresponda. */
  activarPrueba2Min(): void {
    this.prueba2MinLoading.set(true);
    this.usuarioService.configurarSuscripcionPrueba2Min().subscribe({
      next: () => {
        this.prueba2MinLoading.set(false);
        this.cargarPerfil();
      },
      error: (err) => {
        this.prueba2MinLoading.set(false);
        alert(err.error?.mensaje || 'Error al configurar la prueba');
      },
    });
  }

  getSuscripcionRestante(): string {
    if (this.suscripcionExpiradaEnCliente()) return '';
    const seg = this.segundosRestantes();
    if (seg !== null) return `${seg} segundo${seg !== 1 ? 's' : ''} restante${seg !== 1 ? 's' : ''}`;
    const user = this.usuario();
    if (!user?.suscripcionActiva) return '';
    const ahora = new Date();
    if (user.finSuscripcionAt) {
      const fin = new Date(user.finSuscripcionAt);
      const diffMs = fin.getTime() - ahora.getTime();
      if (diffMs <= 0) return '';
      const minutos = Math.floor(diffMs / (1000 * 60));
      const horas = Math.floor(minutos / 60);
      const dias = Math.floor(horas / 24);
      if (minutos < 60) return `${minutos} minuto${minutos !== 1 ? 's' : ''} restante${minutos !== 1 ? 's' : ''}`;
      if (horas < 24) return `${horas} hora${horas !== 1 ? 's' : ''} restante${horas !== 1 ? 's' : ''}`;
      return `${dias} día${dias !== 1 ? 's' : ''} restante${dias !== 1 ? 's' : ''}`;
    }
    if (!user.finSuscripcion) return '';
    const fin = new Date(user.finSuscripcion);
    const diff = fin.getTime() - ahora.getTime();
    const dias = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return `${dias} día${dias !== 1 ? 's' : ''} restante${dias !== 1 ? 's' : ''}`;
  }

  abrirEditar(): void {
    const u = this.usuario();
    if (u) {
      this.editForm = {
        nombre: u.nombre,
        apellido: u.apellido,
        telefono: u.telefono || '',
        username: u.username,
      };
      this.editError.set('');
      this.showEditModal.set(true);
    }
  }

  cerrarEditar(): void {
    this.showEditModal.set(false);
    this.editError.set('');
  }

  guardarEditar(): void {
    this.savingEdit.set(true);
    this.editError.set('');
    this.usuarioService.actualizarPerfil(this.editForm).subscribe({
      next: (data) => {
        this.usuario.set(data);
        this.savingEdit.set(false);
        this.showEditModal.set(false);
      },
      error: (err) => {
        this.editError.set(err.error?.mensaje || 'Error al actualizar los datos');
        this.savingEdit.set(false);
      },
    });
  }

  abrirCambiarPassword(): void {
    this.passwordForm = { contrasenaActual: '', nuevaPassword: '', confirmarPassword: '' };
    this.passwordError.set('');
    this.passwordSuccess.set('');
    this.showPasswordModal.set(true);
  }

  cerrarCambiarPassword(): void {
    this.showPasswordModal.set(false);
    this.passwordError.set('');
    this.passwordSuccess.set('');
  }

  toggleTwoFactor(): void {
    const u = this.usuario();
    if (!u) return;
    const nuevoEstado = !this.twoFactorActiva();
    this.twoFactorLoading.set(true);
    this.usuarioService.actualizarVerificacionDosPasos(nuevoEstado).subscribe({
      next: (data) => {
        this.usuario.set(data);
        this.twoFactorLoading.set(false);
      },
      error: () => this.twoFactorLoading.set(false),
    });
  }

  guardarPassword(): void {
    const { contrasenaActual, nuevaPassword, confirmarPassword } = this.passwordForm;
    if (!contrasenaActual?.trim()) {
      this.passwordError.set('La contraseña actual es obligatoria');
      return;
    }
    if (!nuevaPassword?.trim()) {
      this.passwordError.set('La nueva contraseña es obligatoria');
      return;
    }
    if (nuevaPassword.length < 6) {
      this.passwordError.set('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      this.passwordError.set('La nueva contraseña y la confirmación no coinciden');
      return;
    }
    this.savingPassword.set(true);
    this.passwordError.set('');
    this.usuarioService.cambiarPassword(this.passwordForm).subscribe({
      next: () => {
        this.passwordSuccess.set('Contraseña actualizada correctamente');
        this.savingPassword.set(false);
        setTimeout(() => this.cerrarCambiarPassword(), 1500);
      },
      error: (err) => {
        this.passwordError.set(err.error?.mensaje || 'Error al cambiar la contraseña');
        this.savingPassword.set(false);
      },
    });
  }
}
