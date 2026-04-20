import { Component, OnDestroy, OnInit, signal, viewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { SessionService } from '../../core/service/session.service';
import { ChatbotService } from '../../core/service/chatbot.service';

export interface ChatLinea {
  rol: 'user' | 'assistant';
  texto: string;
}

@Component({
  selector: 'app-asistente',
  imports: [FormsModule, Navbar, Footer, SessionTimeoutModal],
  templateUrl: './asistente.html',
  standalone: true,
})
export class Asistente implements OnInit, OnDestroy {
  private scrollAnchor = viewChild<ElementRef<HTMLDivElement>>('scrollAnchor');

  mensajes = signal<ChatLinea[]>([]);
  entrada = '';
  enviando = signal(false);

  constructor(
    private chatbotService: ChatbotService,
    private sessionService: SessionService,
    private router: Router
  ) {
    effect(() => {
      this.mensajes();
      setTimeout(() => this.scrollAlFinal(), 0);
    });
  }

  ngOnInit(): void {
    this.sessionService.startMonitoring(false);
    this.mensajes.set([
      {
        rol: 'assistant',
        texto:
          'Hola, soy el asistente de ReadNow. Pregúntame cómo usar el catálogo, favoritos, historial, tu perfil o la suscripción.',
      },
    ]);
  }

  ngOnDestroy(): void {
    this.sessionService.stopMonitoring();
  }

  enviar(): void {
    const texto = this.entrada.trim();
    if (!texto || this.enviando()) return;

    this.entrada = '';
    this.mensajes.update((m) => [...m, { rol: 'user', texto }]);
    this.enviando.set(true);

    this.chatbotService
      .enviarMensaje({
        mensaje: texto,
        paginaContexto: this.router.url,
      })
      .subscribe({
        next: (res) => {
          this.mensajes.update((m) => [...m, { rol: 'assistant', texto: res.respuesta }]);
          this.enviando.set(false);
        },
        error: (err) => {
          this.enviando.set(false);
          const msg =
            err.status === 403
              ? (err.error?.mensaje ||
                'Tu suscripción no está activa. Renueva en Planes para usar el asistente.')
              : err.error?.mensaje || 'No se pudo obtener respuesta. Intenta de nuevo.';
          this.mensajes.update((m) => [...m, { rol: 'assistant', texto: msg }]);
        },
      });
  }

  private scrollAlFinal(): void {
    const el = this.scrollAnchor()?.nativeElement;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }
}
