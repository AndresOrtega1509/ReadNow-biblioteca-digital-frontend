import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import {
  getMissingPasswordRequirementsMessage,
  getPasswordChecklist,
  isValidPassword,
  PASSWORD_POLICY_TEXT,
} from '../../core/utils/password-policy';

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
  readonly passwordPolicyText = PASSWORD_POLICY_TEXT;

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

  get invalidPasswordPolicy(): boolean {
    return this.nuevaPassword.length > 0 && !isValidPassword(this.nuevaPassword);
  }

  get passwordChecklist() {
    return getPasswordChecklist(this.nuevaPassword);
  }

  get passwordMissingMessage(): string | null {
    return getMissingPasswordRequirementsMessage(this.nuevaPassword);
  }

  onSubmit(): void {
    if (this.nuevaPassword !== this.confirmarPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    if (!isValidPassword(this.nuevaPassword)) {
      this.error.set(
        getMissingPasswordRequirementsMessage(this.nuevaPassword) ?? this.passwordPolicyText,
      );
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
