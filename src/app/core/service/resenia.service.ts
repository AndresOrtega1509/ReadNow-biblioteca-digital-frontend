import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}
