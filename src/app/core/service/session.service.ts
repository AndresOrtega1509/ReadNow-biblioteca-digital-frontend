import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { UsuarioService } from './usuario.service';
import { SesionConfig } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private inactivityTimer: any;
  private countdownTimer: any;
  private isInReading = false;

  readonly showTimeoutModal = signal(false);
  readonly countdownSeconds = signal(60);

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  startMonitoring(inReading: boolean = false): void {
    this.isInReading = inReading;
    this.resetInactivityTimer();
    this.addEventListeners();
  }

  stopMonitoring(): void {
    this.clearTimers();
    this.removeEventListeners();
    this.showTimeoutModal.set(false);
  }

  setReadingMode(reading: boolean): void {
    this.isInReading = reading;
    this.resetInactivityTimer();
  }

  confirmActivity(): void {
    this.showTimeoutModal.set(false);
    this.clearTimers();
    this.resetInactivityTimer();
    this.usuarioService.registrarActividad().subscribe();
  }

  private resetInactivityTimer(): void {
    clearTimeout(this.inactivityTimer);
    const config = this.authService.getSesionConfig();
    if (!config) return;

    const timeout = this.isInReading
      ? config.inactividadLecturaMs
      : config.inactividadCatalogoMs;

    this.inactivityTimer = setTimeout(() => {
      this.startCountdown(config);
    }, timeout);
  }

  private startCountdown(config: SesionConfig): void {
    const totalSeconds = Math.floor(config.countdownMs / 1000);
    this.countdownSeconds.set(totalSeconds);
    this.showTimeoutModal.set(true);

    this.countdownTimer = setInterval(() => {
      const current = this.countdownSeconds();
      if (current <= 1) {
        this.clearTimers();
        this.showTimeoutModal.set(false);
        this.authService.logout();
      } else {
        this.countdownSeconds.set(current - 1);
      }
    }, 1000);
  }

  private onUserActivity = (): void => {
    if (!this.showTimeoutModal()) {
      this.resetInactivityTimer();
    }
  };

  private addEventListeners(): void {
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, this.onUserActivity);
    });
  }

  private removeEventListeners(): void {
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
      document.removeEventListener(event, this.onUserActivity);
    });
  }

  private clearTimers(): void {
    clearTimeout(this.inactivityTimer);
    clearInterval(this.countdownTimer);
  }
}
