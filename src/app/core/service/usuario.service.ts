import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioResponse, ActualizarPerfilRequest } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  obtenerPerfil(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.apiUrl}/perfil`);
  }

  actualizarPerfil(request: ActualizarPerfilRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.apiUrl}/perfil`, request);
  }

  estadoSuscripcion(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/suscripcion/estado`);
  }

  registrarActividad(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sesion/actividad`, {});
  }
}
