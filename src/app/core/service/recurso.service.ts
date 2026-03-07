import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RecursoRequest, RecursoResponse, MensajeResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class RecursoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listarRecursos(): Observable<RecursoResponse[]> {
    return this.http.get<RecursoResponse[]>(`${this.apiUrl}/api/catalogo/recursos`);
  }

  obtenerRecurso(id: number): Observable<RecursoResponse> {
    return this.http.get<RecursoResponse>(`${this.apiUrl}/api/catalogo/recursos/${id}`);
  }

  buscarRecursos(query: string): Observable<RecursoResponse[]> {
    return this.http.get<RecursoResponse[]>(`${this.apiUrl}/api/catalogo/recursos/buscar`, {
      params: { q: query }
    });
  }

  obtenerMejorCalificados(): Observable<RecursoResponse[]> {
    return this.http.get<RecursoResponse[]>(`${this.apiUrl}/api/catalogo/recursos/mejor-calificados`);
  }

  listarPorTipo(tipoRecursoId: number): Observable<RecursoResponse[]> {
    return this.http.get<RecursoResponse[]>(`${this.apiUrl}/api/catalogo/recursos/tipo/${tipoRecursoId}`);
  }

  listarPorCategoria(categoriaId: number): Observable<RecursoResponse[]> {
    return this.http.get<RecursoResponse[]>(`${this.apiUrl}/api/catalogo/recursos/categoria/${categoriaId}`);
  }

  crearRecurso(recurso: RecursoRequest, archivo: File | null): Observable<RecursoResponse> {
    const formData = new FormData();
    formData.append('recurso', new Blob([JSON.stringify(recurso)], { type: 'application/json' }));
    if (archivo) {
      formData.append('archivo', archivo);
    }
    return this.http.post<RecursoResponse>(`${this.apiUrl}/api/admin/recursos`, formData);
  }

  actualizarRecurso(id: number, recurso: RecursoRequest): Observable<RecursoResponse> {
    debugger;
    return this.http.put<RecursoResponse>(`${this.apiUrl}/api/admin/recursos/${id}`, recurso);
  }

  eliminarRecurso(id: number): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(`${this.apiUrl}/api/admin/recursos/${id}`);
  }
}
