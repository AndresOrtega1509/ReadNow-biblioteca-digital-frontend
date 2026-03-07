import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-restablecer-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './restablecer-password.html',
})
export class RestablecerPassword implements OnInit {
  token = '';
  nuevaPassword = '';
  confirmarPassword = '';
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.router.navigate(['/recuperar-password']);
    }
  }

  get passwordsMismatch(): boolean {
    return this.confirmarPassword.length > 0 && this.nuevaPassword !== this.confirmarPassword;
  }

  onSubmit(): void {
    if (this.nuevaPassword !== this.confirmarPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService
      .restablecerPassword({ token: this.token, nuevaPassword: this.nuevaPassword })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.exitoso) {
            this.success.set(res.mensaje || 'Contraseña restablecida exitosamente.');
            setTimeout(() => this.router.navigate(['/login']), 3000);
          } else {
            this.error.set(res.mensaje);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.mensaje || 'Error al restablecer la contraseña');
        },
      });
  }
}
