import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FavoritoResponse, MensajeResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private apiUrl = `${environment.apiUrl}/api/favoritos`;

  constructor(private http: HttpClient) {}

  agregarFavorito(recursoId: number): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.apiUrl}/${recursoId}`, {});
  }

  eliminarFavorito(favoritoId: number): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(`${this.apiUrl}/${favoritoId}`);
  }

  listarFavoritos(): Observable<FavoritoResponse[]> {
    return this.http.get<FavoritoResponse[]>(this.apiUrl);
  }
}
