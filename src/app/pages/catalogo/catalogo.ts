import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { ResourceCard } from '../../shared/components/resource-card/resource-card';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { RecursoService } from '../../core/service/recurso.service';
import { SessionService } from '../../core/service/session.service';
import { RecursoResponse } from '../../core/models/interfaces';
import { getTipoRecursoColor, COLOR_SECCION_TOP_10, COLOR_SECCION_TODOS_RECURSOS, COLOR_SECCION_CATEGORIA } from '../../core/constants/tipo-recurso-colors';

@Component({
  selector: 'app-catalogo',
  imports: [FormsModule, RouterLink, Navbar, Footer, ResourceCard, SessionTimeoutModal],
  templateUrl: './catalogo.html',
  standalone: true
})
export class Catalogo implements OnInit, OnDestroy {
  recursos = signal<RecursoResponse[]>([]);
  mejorCalificados = signal<RecursoResponse[]>([]);
  resultadosBusqueda = signal<RecursoResponse[]>([]);
  seccionesPorTipo = signal<{ nombre: string; recursos: RecursoResponse[] }[]>([]);
  seccionesPorCategoria = signal<{ nombre: string; recursos: RecursoResponse[] }[]>([]);
  featuredResource = signal<RecursoResponse | null>(null);
  searchQuery = '';
  searching = signal(false);
  loading = signal(true);

  constructor(
    private recursoService: RecursoService,
    private sessionService: SessionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.sessionService.startMonitoring(false);
    this.cargarDatos();
    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q') ?? '';
      this.searchQuery = q;
      if (q.trim()) {
        this.buscar();
      } else {
        this.resultadosBusqueda.set([]);
        this.searching.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.sessionService.stopMonitoring();
  }

  cargarDatos(): void {
    this.recursoService.listarRecursos().subscribe({
      next: (data) => {
        this.recursos.set(data);
        this.construirSecciones();
        this.loading.set(false);
      },
    });
    this.recursoService.obtenerMejorCalificados().subscribe({
      next: (data) => {
        this.mejorCalificados.set(data);
        if (data.length > 0) {
          const conPortada = data.filter(r => r.urlPortada);
          const destacado = conPortada.length > 0 ? conPortada[0] : data[0];
          this.featuredResource.set(destacado);
        }
      },
    });
  }

  private construirSecciones(): void {
    const lista = this.recursos();

    const mapaTipo = new Map<string, RecursoResponse[]>();
    const mapaCategoria = new Map<string, RecursoResponse[]>();

    for (const r of lista) {
      if (r.tipoRecurso) {
        const arr = mapaTipo.get(r.tipoRecurso) ?? [];
        arr.push(r);
        mapaTipo.set(r.tipoRecurso, arr);
      }
      if (r.categoriaRecurso) {
        const arrCat = mapaCategoria.get(r.categoriaRecurso) ?? [];
        arrCat.push(r);
        mapaCategoria.set(r.categoriaRecurso, arrCat);
      }
    }

    this.seccionesPorTipo.set(
      Array.from(mapaTipo.entries())
        .filter(([, recursos]) => recursos.length > 0)
        .map(([nombre, recursos]) => ({ nombre, recursos }))
    );

    this.seccionesPorCategoria.set(
      Array.from(mapaCategoria.entries())
        .filter(([, recursos]) => recursos.length > 0)
        .map(([nombre, recursos]) => ({ nombre, recursos }))
    );
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
    this.router.navigate([], { queryParams: { q: null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  getTipoColor(nombre: string): string {
    return getTipoRecursoColor(nombre);
  }

  readonly colorSeccionTop10 = COLOR_SECCION_TOP_10;
  readonly colorSeccionTodosRecursos = COLOR_SECCION_TODOS_RECURSOS;
  readonly colorSeccionCategoria = COLOR_SECCION_CATEGORIA;

  scrollCarousel(elementId: string, direction: 'left' | 'right'): void {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  }

  leerRecurso(id: number): void {
    this.router.navigate(['/catalogo', id]);
  }

  /** URL de portada del destacado: la del recurso o fallback para "La mudanza de los poderes" si el backend aún no devuelve urlPortada */
  getPortadaUrl(recurso: RecursoResponse | null): string | null {
    if (!recurso) return null;
    if (recurso.urlPortada?.trim()) return recurso.urlPortada.trim();
    if (recurso.nombre?.toLowerCase().includes('mudanza')) {
      return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1600&q=80';
    }
    return null;
  }
}
