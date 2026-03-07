import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private router: Router) {}

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
