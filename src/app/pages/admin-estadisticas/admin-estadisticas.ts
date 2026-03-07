import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Navbar } from '../../shared/components/navbar/navbar';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { EstadisticasService } from '../../core/service/estadisticas.service';
import { EstadisticasResponse } from '../../core/models/interfaces';

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

  getBarColor(index: number): string {
    const colors = ['#e21143', '#6c5ce7', '#ffd32a', '#00b894', '#ff4757', '#0984e3', '#e17055', '#00cec9', '#fdcb6e', '#a29bfe'];
    return colors[index % colors.length];
  }
}
