import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HistoriaLecturaResponse, MensajeResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private apiUrl = `${environment.apiUrl}/api/historial`;

  constructor(private http: HttpClient) {}

  registrarLectura(recursoId: number): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.apiUrl}/${recursoId}`, {});
  }

  obtenerHistorial(): Observable<HistoriaLecturaResponse[]> {
    return this.http.get<HistoriaLecturaResponse[]>(this.apiUrl);
  }
}
