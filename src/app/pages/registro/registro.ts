import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
})
export class Registro {
  nombre = '';
  apellido = '';
  email = '';
  telefono = '';
  username = '';
  password = '';
  confirmarPassword = '';
  loading = signal(false);
  error = signal('');
  success = signal('');
  aceptaDatos: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  get passwordsMismatch(): boolean {
    return this.confirmarPassword.length > 0 && this.password !== this.confirmarPassword;
  }

  onSubmit(): void {

  if (!this.aceptaDatos) {
    this.error.set('Debes aceptar el tratamiento de datos para continuar.');
    return;
  }

    if (this.password !== this.confirmarPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService
      .registro({
        nombre: this.nombre,
        apellido: this.apellido,
        email: this.email,
        telefono: this.telefono,
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.exitoso) {
            this.success.set(res.mensaje || 'Registro exitoso. Redirigiendo al inicio de sesión...');
            setTimeout(() => this.router.navigate(['/login']), 2500);
          } else {
            this.error.set(res.mensaje);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.mensaje || 'Error al registrarse');
        },
      });
  }
}
