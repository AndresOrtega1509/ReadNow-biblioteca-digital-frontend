import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { UsuarioService } from '../../core/service/usuario.service';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from '../../core/service/session.service';
import { UsuarioResponse, ActualizarPerfilRequest } from '../../core/models/interfaces';

@Component({
  selector: 'app-perfil',
  imports: [DatePipe, FormsModule, Navbar, Footer, SessionTimeoutModal],
  templateUrl: './perfil.html',
  standalone: true,
})
export class Perfil implements OnInit, OnDestroy {
  usuario = signal<UsuarioResponse | null>(null);
  loading = signal(true);
  showEditModal = signal(false);
  savingEdit = signal(false);
  editError = signal('');
  editForm: ActualizarPerfilRequest = { nombre: '', apellido: '', telefono: '', username: '' };

  constructor(
    private usuarioService: UsuarioService,
    protected authService: AuthService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.sessionService.startMonitoring(false);
    this.cargarPerfil();
  }

  ngOnDestroy(): void {
    this.sessionService.stopMonitoring();
  }

  cargarPerfil(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (data) => {
        this.usuario.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getSuscripcionDias(): number {
    const user = this.usuario();
    if (!user?.finSuscripcion) return 0;
    const fin = new Date(user.finSuscripcion);
    const hoy = new Date();
    const diff = fin.getTime() - hoy.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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
}
