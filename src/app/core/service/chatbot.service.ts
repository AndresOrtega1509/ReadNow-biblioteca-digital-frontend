import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatMensajeRequest, ChatMensajeResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private apiUrl = `${environment.apiUrl}/api/chat`;

  constructor(private http: HttpClient) {}

  enviarMensaje(request: ChatMensajeRequest): Observable<ChatMensajeResponse> {
    return this.http.post<ChatMensajeResponse>(`${this.apiUrl}/mensaje`, request);
  }
}
