import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-verificacion',
  imports: [FormsModule, RouterLink],
  templateUrl: './verificacion.html',
})
export class Verificacion implements OnInit, OnDestroy {
  codigo = '';
  email = '';
  loading = signal(false);
  resending = signal(false);
  error = signal('');
  timerSeconds = signal(300);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('pendingEmail') || '';
    if (!this.email) {
      this.router.navigate(['/login']);
      return;
    }
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer(): void {
    this.timerSeconds.set(300);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      const current = this.timerSeconds();
      if (current <= 0) {
        if (this.timerInterval) clearInterval(this.timerInterval);
      } else {
        this.timerSeconds.set(current - 1);
      }
    }, 1000);
  }

  get timerDisplay(): string {
    const mins = Math.floor(this.timerSeconds() / 60);
    const secs = this.timerSeconds() % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  get timerExpired(): boolean {
    return this.timerSeconds() <= 0;
  }

  resendCode(): void {
    const savedPassword = localStorage.getItem('pendingPassword');
    if (!savedPassword) {
      this.error.set('No se puede reenviar el código. Inicia sesión de nuevo.');
      return;
    }
    this.resending.set(true);
    this.error.set('');
    this.authService.login({ email: this.email, password: savedPassword }).subscribe({
      next: () => {
        this.resending.set(false);
        this.startTimer();
      },
      error: (err) => {
        this.resending.set(false);
        this.error.set(err.error?.mensaje || 'Error al reenviar el código');
      },
    });
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');
    this.authService.verificarCodigo({ email: this.email, codigo: this.codigo }).subscribe({
      next: () => {
        this.loading.set(false);
        localStorage.removeItem('pendingEmail');
        localStorage.removeItem('pendingPassword');
        this.router.navigate(['/catalogo']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje || 'Código incorrecto');
      },
    });
  }
}
