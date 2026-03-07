import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoriaRecursoResponse, CategoriaRecursoRequest, MensajeResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/api/admin/categorias`;

  constructor(private http: HttpClient) {}

  listar(): Observable<CategoriaRecursoResponse[]> {
    return this.http.get<CategoriaRecursoResponse[]>(this.apiUrl);
  }

  crear(request: CategoriaRecursoRequest): Observable<CategoriaRecursoResponse> {
    return this.http.post<CategoriaRecursoResponse>(this.apiUrl, request);
  }

  actualizar(id: number, request: CategoriaRecursoRequest): Observable<CategoriaRecursoResponse> {
    return this.http.put<CategoriaRecursoResponse>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(`${this.apiUrl}/${id}`);
  }
}
