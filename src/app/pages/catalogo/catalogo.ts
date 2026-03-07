import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { ResourceCard } from '../../shared/components/resource-card/resource-card';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { RecursoService } from '../../core/service/recurso.service';
import { SessionService } from '../../core/service/session.service';
import { RecursoResponse } from '../../core/models/interfaces';

@Component({
  selector: 'app-catalogo',
  imports: [FormsModule, Navbar, Footer, ResourceCard, SessionTimeoutModal],
  templateUrl: './catalogo.html',
  standalone: true
})
export class Catalogo implements OnInit, OnDestroy {
  recursos = signal<RecursoResponse[]>([]);
  mejorCalificados = signal<RecursoResponse[]>([]);
  resultadosBusqueda = signal<RecursoResponse[]>([]);
  featuredResource = signal<RecursoResponse | null>(null);
  searchQuery = '';
  searching = signal(false);
  loading = signal(true);

  constructor(
    private recursoService: RecursoService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sessionService.startMonitoring(false);
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.sessionService.stopMonitoring();
  }

  cargarDatos(): void {
    this.recursoService.listarRecursos().subscribe({
      next: (data) => {
        this.recursos.set(data);
        if (data.length > 0) {
          this.featuredResource.set(data[Math.floor(Math.random() * Math.min(data.length, 5))]);
        }
        this.loading.set(false);
      },
    });
    this.recursoService.obtenerMejorCalificados().subscribe({
      next: (data) => this.mejorCalificados.set(data),
    });
  }

  buscar(): void {
    if (!this.searchQuery.trim()) {
      this.resultadosBusqueda.set([]);
      this.searching.set(false);
      return;
    }
    this.searching.set(true);
    this.recursoService.buscarRecursos(this.searchQuery).subscribe({
      next: (data) => this.resultadosBusqueda.set(data),
    });
  }

  limpiarBusqueda(): void {
    this.searchQuery = '';
    this.resultadosBusqueda.set([]);
    this.searching.set(false);
  }

  scrollCarousel(elementId: string, direction: 'left' | 'right'): void {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  }

  leerRecurso(id: number): void {
    this.router.navigate(['/catalogo', id]);
  }
}
