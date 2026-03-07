import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadisticasResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private apiUrl = `${environment.apiUrl}/api/admin/estadisticas`;

  constructor(private http: HttpClient) {}

  obtenerEstadisticas(): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(this.apiUrl);
  }
}
