import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioResponse, ActualizarPerfilRequest, CambiarPasswordRequest, MensajeResponse } from '../models/interfaces';

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

  actualizarVerificacionDosPasos(activo: boolean): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.apiUrl}/perfil/verificacion-dos-pasos`, { activo });
  }

  cambiarPassword(request: CambiarPasswordRequest): Observable<MensajeResponse> {
    const body = {
      contraseñaActual: request.contrasenaActual,
      nuevaPassword: request.nuevaPassword,
      confirmarPassword: request.confirmarPassword,
    };
    return this.http.put<MensajeResponse>(`${this.apiUrl}/perfil/contrasena`, body);
  }

  estadoSuscripcion(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/suscripcion/estado`);
  }

  puedeAccederAlCatalogo(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/puede-acceder-catalogo`);
  }

  /** Prueba: configura la suscripción para vencer en 2 minutos. Solo usuario "prueba". */
  configurarSuscripcionPrueba2Min(): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.apiUrl}/suscripcion/prueba-2min`, {});
  }

  registrarActividad(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sesion/actividad`, {});
  }
}
