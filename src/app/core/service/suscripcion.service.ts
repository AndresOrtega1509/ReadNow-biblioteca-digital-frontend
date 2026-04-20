import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MensajeResponse, StripeCheckoutSessionResponse, SuscripcionPlanesCatalogo } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class SuscripcionService {
  private readonly base = `${environment.apiUrl}/api/suscripcion`;

  constructor(private http: HttpClient) {}

  obtenerPlanes(): Observable<SuscripcionPlanesCatalogo> {
    return this.http.get<SuscripcionPlanesCatalogo>(`${this.base}/planes`);
  }

  activarPruebaGratuita(): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.base}/prueba-gratuita`, {});
  }

  crearCheckout(codigoPlan: string): Observable<StripeCheckoutSessionResponse> {
    return this.http.post<StripeCheckoutSessionResponse>(`${this.base}/checkout`, { codigoPlan });
  }

  abrirPortalGestion(): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.base}/portal-gestion`, {});
  }
}
