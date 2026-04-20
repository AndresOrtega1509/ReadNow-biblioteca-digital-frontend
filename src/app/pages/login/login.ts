import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  info = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    if (q.get('cuenta') === 'desactivada') {
      this.error.set('Tu cuenta está desactivada. Si necesitas volver a acceder, contacta al soporte de ReadNow.');
    }
    if (q.get('baja') === 'ok') {
      this.info.set(
        'Tu solicitud fue registrada. Tu cuenta quedó desactivada; conservamos tus datos según las políticas de la plataforma. Gracias por haber usado ReadNow.'
      );
    }
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (!res.exitoso) {
          this.error.set(res.mensaje ?? 'Error al iniciar sesión');
          return;
        }
        // Sin 2FA (desarrollo): backend devuelve token y datos → entrar directo al catálogo
        if (res.token && res.email != null && res.rol != null && res.nombre != null && res.usuarioId != null && res.sesionConfig) {
          this.authService.setSession({
            token: res.token,
            email: res.email,
            rol: res.rol,
            nombre: res.nombre,
            username: res.username ?? res.nombre ?? '',
            usuarioId: res.usuarioId,
            sesionConfig: res.sesionConfig,
          });
          this.router.navigate(['/catalogo']);
          return;
        }
        // Con 2FA: ir a verificar código
        localStorage.setItem('pendingEmail', this.email);
        this.router.navigate(['/verificar']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje || 'Error al iniciar sesión');
      },
    });
  }
}
