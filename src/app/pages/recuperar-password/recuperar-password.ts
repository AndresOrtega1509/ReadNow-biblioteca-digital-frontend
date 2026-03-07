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
  email = '';
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.recuperarPassword({ email: this.email }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.exitoso) {
          this.success.set(res.mensaje || 'Se ha enviado un enlace de recuperación a tu correo.');
        } else {
          this.error.set(res.mensaje);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje || 'Error al enviar el enlace de recuperación');
      },
    });
  }
}
