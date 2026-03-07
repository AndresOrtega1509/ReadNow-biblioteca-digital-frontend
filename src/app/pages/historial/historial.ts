import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { HistorialService } from '../../core/service/historial.service';
import { SessionService } from '../../core/service/session.service';
import { HistoriaLecturaResponse } from '../../core/models/interfaces';

@Component({
  selector: 'app-historial',
  imports: [DatePipe, Navbar, Footer, SessionTimeoutModal],
  templateUrl: './historial.html',
})
export class Historial implements OnInit, OnDestroy {
  historial = signal<HistoriaLecturaResponse[]>([]);
  loading = signal(true);

  constructor(
    private historialService: HistorialService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sessionService.startMonitoring(false);
    this.cargarHistorial();
  }

  ngOnDestroy(): void {
    this.sessionService.stopMonitoring();
  }

  cargarHistorial(): void {
    this.historialService.obtenerHistorial().subscribe({
      next: (data) => {
        this.historial.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  verRecurso(recursoId: number): void {
    this.router.navigate(['/catalogo', recursoId]);
  }
}
