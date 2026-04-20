import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ReseniaRequest, ReseniaResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ReseniaService {
  private apiUrl = `${environment.apiUrl}/api/resenias`;

  constructor(private http: HttpClient) {}

  crearResenia(request: ReseniaRequest): Observable<ReseniaResponse> {
    return this.http.post<ReseniaResponse>(this.apiUrl, request);
  }

  obtenerResenias(recursoId: number): Observable<ReseniaResponse[]> {
    return this.http.get<ReseniaResponse[]>(`${this.apiUrl}/recurso/${recursoId}`);
  }

  /** Solo rol ADMIN (el backend rechaza el resto). Respuesta 204 sin cuerpo: evitar parseo JSON. */
  eliminarComoAdmin(reseniaId: number): Observable<void> {
    return this.http
      .delete(`${this.apiUrl}/${reseniaId}`, { responseType: 'text' })
      .pipe(map(() => undefined));
  }
}
