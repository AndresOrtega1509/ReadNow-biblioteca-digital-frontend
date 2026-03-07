import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CalificacionRequest, CalificacionResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class CalificacionService {
  private apiUrl = `${environment.apiUrl}/api/calificaciones`;

  constructor(private http: HttpClient) {}

  calificar(request: CalificacionRequest): Observable<CalificacionResponse> {
    return this.http.post<CalificacionResponse>(this.apiUrl, request);
  }

  obtenerPromedio(recursoId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/recurso/${recursoId}/promedio`);
  }

  obtenerCalificaciones(recursoId: number): Observable<CalificacionResponse[]> {
    return this.http.get<CalificacionResponse[]>(`${this.apiUrl}/recurso/${recursoId}`);
  }
}
