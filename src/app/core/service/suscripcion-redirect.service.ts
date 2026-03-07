import { Injectable } from '@angular/core';

/** Guarda temporalmente si la redirección a perfil fue por suscripción vencida (sin usar query params). */
@Injectable({ providedIn: 'root' })
export class SuscripcionRedirectService {
  private redirectPorVencida = false;

  marcarRedirectPorVencida(): void {
    this.redirectPorVencida = true;
  }

  /** Devuelve true si hubo redirección por vencida y limpia el flag. */
  consumirRedirectPorVencida(): boolean {
    const valor = this.redirectPorVencida;
    this.redirectPorVencida = false;
    return valor;
  }
}
