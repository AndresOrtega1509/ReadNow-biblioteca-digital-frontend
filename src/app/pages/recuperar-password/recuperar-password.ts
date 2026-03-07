import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-recuperar-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './recuperar-password.html',
})
export class RecuperarPassword {
  step = signal<1 | 2>(1);
  email = '';
  ultimos4Digitos = '';

  /** Número enmascarado (ej. 302945****) para mostrar en paso 2 */
  telefonoEnmascarado = signal<string | null>(null);

  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(private authService: AuthService) {}

  onSubmitPaso1(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.recuperarPassword({ email: this.email }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.exitoso) {
          this.telefonoEnmascarado.set(res.telefonoEnmascarado ?? null);
          this.step.set(2);
        } else {
          this.error.set(res.mensaje || 'Error.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje || 'Error al solicitar recuperación.');
      },
    });
  }

  onSubmitPaso2(): void {
    this.loading.set(true);
    this.error.set('');

    this.authService
      .verificarTelefonoRecuperacion({ email: this.email, ultimos4Digitos: this.ultimos4Digitos })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.exitoso) {
            this.success.set(res.mensaje || 'Revisa tu correo. Te enviamos un enlace para restablecer tu contraseña.');
          } else {
            this.error.set(res.mensaje || 'Datos incorrectos.');
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.mensaje || 'Datos incorrectos. Verifica tu correo y los últimos 4 dígitos.');
        },
      });
  }
}
