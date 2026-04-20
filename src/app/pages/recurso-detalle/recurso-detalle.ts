import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { StarRating } from '../../shared/components/star-rating/star-rating';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { RecursoService } from '../../core/service/recurso.service';
import { CalificacionService } from '../../core/service/calificacion.service';
import { ReseniaService } from '../../core/service/resenia.service';
import { FavoritoService } from '../../core/service/favorito.service';
import { HistorialService } from '../../core/service/historial.service';
import { SessionService } from '../../core/service/session.service';
import { AuthService } from '../../core/service/auth.service';
import { AccessibilityService } from '../../core/service/accessibility.service';
import {
  RecursoResponse,
  ReseniaResponse,
  CalificacionRequest,
  ReseniaRequest,
} from '../../core/models/interfaces';

@Component({
  selector: 'app-recurso-detalle',
  imports: [FormsModule, DatePipe, DecimalPipe, Navbar, Footer, StarRating, SessionTimeoutModal],
  templateUrl: './recurso-detalle.html',
  standalone: true
})
export class RecursoDetalle implements OnInit, OnDestroy {
  recurso = signal<RecursoResponse | null>(null);
  resenias = signal<ReseniaResponse[]>([]);
  promedioCalificacion = signal(0);
  userRating = signal(0);
  loading = signal(true);
  isFavorito = signal(false);
  favoritoId = signal<number | null>(null);
  readingMode = signal(false);
  nuevaResenia = '';
  mensaje = signal('');
  mensajeTipo = signal<'success' | 'error' | ''>('');
  /** Confirmación in-app (solo admin) antes de borrar una reseña. */
  reseniaPendienteEliminar = signal<ReseniaResponse | null>(null);
  eliminandoResenia = signal(false);

  private recursoId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recursoService: RecursoService,
    private calificacionService: CalificacionService,
    private reseniaService: ReseniaService,
    private favoritoService: FavoritoService,
    private historialService: HistorialService,
    private sessionService: SessionService,
    protected authService: AuthService,
    private sanitizer: DomSanitizer,
    protected a11y: AccessibilityService
  ) {}

  ngOnInit(): void {
    this.sessionService.startMonitoring(false);
    this.route.params.subscribe((params) => {
      this.recursoId = +params['id'];
      this.cargarRecurso();
      this.cargarResenias();
      this.cargarPromedio();
      this.cargarMiCalificacion();
    });
  }

  ngOnDestroy(): void {
    this.sessionService.stopMonitoring();
  }

  cargarRecurso(): void {
    this.recursoService.obtenerRecurso(this.recursoId).subscribe({
      next: (data) => {
        this.recurso.set(data);
        this.loading.set(false);
        this.cargarEstadoFavorito();
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/catalogo']);
      },
    });
  }

  cargarEstadoFavorito(): void {
    this.favoritoService.listarFavoritos().subscribe({
      next: (lista) => {
        const fav = lista.find((f) => f.recursoId === this.recursoId);
        this.isFavorito.set(!!fav);
        this.favoritoId.set(fav?.favoritoId ?? null);
      },
    });
  }

  cargarResenias(): void {
    this.reseniaService.obtenerResenias(this.recursoId).subscribe({
      next: (data) => this.resenias.set(data),
    });
  }

  cargarPromedio(): void {
    this.calificacionService.obtenerPromedio(this.recursoId).subscribe({
      next: (data) => this.promedioCalificacion.set(data),
    });
  }

  cargarMiCalificacion(): void {
    this.calificacionService.obtenerMiCalificacion(this.recursoId).subscribe({
      next: (valor) => this.userRating.set(valor),
      error: () => this.userRating.set(0),
    });
  }

  calificar(valor: number): void {
    const req: CalificacionRequest = { recursoId: this.recursoId, valor };
    this.calificacionService.calificar(req).subscribe({
      next: () => {
        this.userRating.set(valor);
        this.mostrarMensaje('Calificación guardada', 'success');
        this.cargarPromedio();
      },
      error: () => this.mostrarMensaje('Error al calificar', 'error'),
    });
  }

  enviarResenia(): void {
    if (!this.nuevaResenia.trim()) return;
    const req: ReseniaRequest = {
      recursoId: this.recursoId,
      descripcion: this.nuevaResenia.trim(),
    };
    this.reseniaService.crearResenia(req).subscribe({
      next: () => {
        this.nuevaResenia = '';
        this.mostrarMensaje('Reseña publicada', 'success');
        this.cargarResenias();
      },
      error: () => this.mostrarMensaje('Error al publicar reseña', 'error'),
    });
  }

  eliminarReseniaAdmin(resenia: ReseniaResponse): void {
    if (!this.authService.isAdmin()) return;
    this.reseniaPendienteEliminar.set(resenia);
  }

  cerrarModalEliminarResenia(): void {
    if (this.eliminandoResenia()) return;
    this.reseniaPendienteEliminar.set(null);
  }

  confirmarEliminarResenia(): void {
    const resenia = this.reseniaPendienteEliminar();
    if (!resenia || !this.authService.isAdmin()) return;
    this.eliminandoResenia.set(true);
    this.reseniaService
      .eliminarComoAdmin(resenia.reseniaId)
      .pipe(finalize(() => this.eliminandoResenia.set(false)))
      .subscribe({
        next: () => {
          this.reseniaPendienteEliminar.set(null);
          this.mostrarMensaje('Reseña eliminada', 'success');
          this.cargarResenias();
        },
        error: () => this.mostrarMensaje('No se pudo eliminar la reseña', 'error'),
      });
  }

  agregarFavorito(): void {
    if (this.isFavorito()) {
      const id = this.favoritoId();
      if (id == null) return;
      this.favoritoService.eliminarFavorito(id).subscribe({
        next: () => {
          this.isFavorito.set(false);
          this.favoritoId.set(null);
          this.mostrarMensaje('Removido de favoritos', 'success');
        },
        error: () => this.mostrarMensaje('Error al remover de favoritos', 'error'),
      });
      return;
    }
    this.favoritoService.agregarFavorito(this.recursoId).subscribe({
      next: () => {
        this.mostrarMensaje('Añadido a favoritos', 'success');
        this.cargarEstadoFavorito();
      },
      error: () => this.mostrarMensaje('Error al añadir a favoritos', 'error'),
    });
  }

  leerRecurso(): void {
    const url = this.recurso()?.urlArchivo;
    if (!url) return;
    this.historialService.registrarLectura(this.recursoId).subscribe({
      next: () => {
        this.readingMode.set(true);
        this.sessionService.setReadingMode(true);
      },
      error: (err) => {
        const msg = err.status === 403
          ? (err.error?.mensaje || 'Tu suscripción ha vencido. Renueva para leer recursos.')
          : 'Error al abrir el recurso';
        this.mostrarMensaje(msg, 'error');
      },
    });
  }

  cerrarVisorPdf(): void {
    this.readingMode.set(false);
    this.sessionService.setReadingMode(false);
  }

  /** URL del PDF para el iframe (toolbar=0 para ocultar barra y reducir opción de descarga) */
  get pdfViewerUrl(): SafeResourceUrl | null {
    const url = this.recurso()?.urlArchivo;
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url + this.a11y.getPdfUrlHash());
  }

  getTypeColor(): string {
    const type = this.recurso()?.tipoRecurso?.toLowerCase() || '';
    const colors: Record<string, string> = {
      libro: '#6c5ce7',
      tesis: '#00b894',
      revista: '#e17055',
      artículo: '#0984e3',
      manual: '#fdcb6e',
    };
    return colors[type] || '#6c5ce7';
  }

  volver(): void {
    this.router.navigate(['/catalogo']);
  }

  private mostrarMensaje(msg: string, tipo: 'success' | 'error'): void {
    this.mensaje.set(msg);
    this.mensajeTipo.set(tipo);
    setTimeout(() => {
      this.mensaje.set('');
      this.mensajeTipo.set('');
    }, 3000);
  }
}
