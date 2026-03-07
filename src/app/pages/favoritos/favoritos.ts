import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { SessionTimeoutModal } from '../../shared/components/session-timeout-modal/session-timeout-modal';
import { FavoritoService } from '../../core/service/favorito.service';
import { SessionService } from '../../core/service/session.service';
import { FavoritoResponse } from '../../core/models/interfaces';

@Component({
  selector: 'app-favoritos',
  imports: [Navbar, Footer, SessionTimeoutModal],
  templateUrl: './favoritos.html',
})
export class Favoritos implements OnInit, OnDestroy {
  favoritos = signal<FavoritoResponse[]>([]);
  loading = signal(true);

  constructor(
    private favoritoService: FavoritoService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sessionService.startMonitoring(false);
    this.cargarFavoritos();
  }

  ngOnDestroy(): void {
    this.sessionService.stopMonitoring();
  }

  cargarFavoritos(): void {
    this.favoritoService.listarFavoritos().subscribe({
      next: (data) => {
        this.favoritos.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  eliminarFavorito(favoritoId: number): void {
    this.favoritoService.eliminarFavorito(favoritoId).subscribe({
      next: () => {
        this.favoritos.update((list) =>
          list.filter((f) => f.favoritoId !== favoritoId)
        );
      },
    });
  }

  verRecurso(recursoId: number): void {
    this.router.navigate(['/catalogo', recursoId]);
  }
}
