import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Navbar } from '../../shared/components/navbar/navbar';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { EstadisticasService } from '../../core/service/estadisticas.service';
import { EstadisticasResponse } from '../../core/models/interfaces';
import { getTipoRecursoColor, COLOR_SECCION_CATEGORIA } from '../../core/constants/tipo-recurso-colors';

@Component({
  selector: 'app-admin-estadisticas',
  imports: [DecimalPipe, Navbar, SessionTimeoutModal],
  templateUrl: './admin-estadisticas.html',
})
export class AdminEstadisticas implements OnInit {
  stats = signal<EstadisticasResponse | null>(null);
  loading = signal(true);

  constructor(private estadisticasService: EstadisticasService) {}

  ngOnInit(): void {
    this.estadisticasService.obtenerEstadisticas().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getMaxRecursosPorTipo(): number {
    const s = this.stats();
    if (!s || !s.recursosPorTipo.length) return 1;
    return Math.max(...s.recursosPorTipo.map(r => r.cantidad));
  }

  getBarWidth(cantidad: number): string {
    return `${(cantidad / this.getMaxRecursosPorTipo()) * 100}%`;
  }

  getBarColor(tipoRecurso: string): string {
    return getTipoRecursoColor(tipoRecurso);
  }

  readonly colorCategoria = COLOR_SECCION_CATEGORIA;
}
