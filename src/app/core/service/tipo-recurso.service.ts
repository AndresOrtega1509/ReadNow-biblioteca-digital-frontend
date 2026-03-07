import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TipoRecursoResponse, TipoRecursoRequest, MensajeResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class TipoRecursoService {
  private apiUrl = `${environment.apiUrl}/api/admin/recursos/tipos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<TipoRecursoResponse[]> {
    return this.http.get<TipoRecursoResponse[]>(this.apiUrl);
  }

  crear(request: TipoRecursoRequest): Observable<TipoRecursoResponse> {
    return this.http.post<TipoRecursoResponse>(this.apiUrl, request);
  }

  actualizar(id: number, request: TipoRecursoRequest): Observable<TipoRecursoResponse> {
    return this.http.put<TipoRecursoResponse>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(`${this.apiUrl}/${id}`);
  }
}
