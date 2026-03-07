import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import {
  LoginRequest, LoginResponse, LoginResult, MensajeResponse,
  RegistroRequest, VerificacionCodigoRequest,
  RecuperarPasswordRequest, RestablecerPasswordRequest,
  SesionConfig
} from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUser = signal<LoginResponse | null>(null);

  readonly isAuthenticated = computed(() => !!this.getToken());
  readonly userName = computed(() => this.currentUser()?.nombre ?? '');
  readonly userRole = computed(() => this.currentUser()?.rol ?? '');
  readonly isAdmin = computed(() => this.userRole() === 'ADMIN');
  readonly sesionConfig = computed(() => this.currentUser()?.sesionConfig);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser.set(JSON.parse(userData));
    }
  }

  registro(request: RegistroRequest): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.apiUrl}/registro`, request);
  }

  login(request: LoginRequest): Observable<LoginResult> {
    return this.http.post<LoginResult>(`${this.apiUrl}/login`, request);
  }

  /** Guarda token y usuario en localStorage y en el signal (p. ej. tras login sin 2FA o verificar código) */
  setSession(data: LoginResponse): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    this.currentUser.set(data);
  }

  verificarCodigo(request: VerificacionCodigoRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/verificar`, request).pipe(
      tap(response => this.setSession(response))
    );
  }

  recuperarPassword(request: RecuperarPasswordRequest): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.apiUrl}/recuperar`, request);
  }

  restablecerPassword(request: RestablecerPasswordRequest): Observable<MensajeResponse> {
    return this.http.put<MensajeResponse>(`${this.apiUrl}/restablecer`, request);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getSesionConfig(): SesionConfig | undefined {
    return this.currentUser()?.sesionConfig;
  }

  getUserId(): number | null {
    return this.currentUser()?.usuarioId ?? null;
  }
}
