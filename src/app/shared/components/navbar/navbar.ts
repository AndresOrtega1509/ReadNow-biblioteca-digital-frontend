import { Component, OnInit, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UsuarioResponse } from '../../../core/models/interfaces';
import { AuthService } from '../../../core/service/auth.service';
import { UsuarioService } from '../../../core/service/usuario.service';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  standalone: true
})
export class Navbar implements OnInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Perfil del API; se limpia al cerrar sesión. */
  readonly perfil = signal<UsuarioResponse | null>(null);

  readonly navDisplayName = computed(() => {
    const p = this.perfil();
    if (p) {
      const full = `${p.nombre ?? ''} ${p.apellido ?? ''}`.trim();
      if (full) return full;
    }
    return this.authService.userUsername() || this.authService.userName() || 'Usuario';
  });

  /** Catálogo / asistente: mismo criterio que puedeAccederAlCatalogo en backend. */
  readonly puedeVerAsistente = computed(() => {
    if (this.authService.isAdmin()) {
      return true;
    }
    const p = this.perfil();
    return p !== null && p.suscripcionActiva === true;
  });

  /** Misma idea que perfil.etiquetaTipoSuscripcion; admins ven rol. */
  readonly navPlanEtiqueta = computed(() => {
    if (this.authService.isAdmin()) {
      return 'Administrador';
    }
    const p = this.perfil();
    if (p === null) {
      return '';
    }
    if (!p.suscripcionActiva) {
      return 'Suscripción expirada';
    }
    const n = p.nombrePlanSuscripcion?.trim();
    return n || 'Suscripción activa';
  });

  showUserMenu = false;
  showMobileMenu = false;
  showSearchBar = false;
  searchQuery = '';

  private searchInput$ = new Subject<string>();
  private sub?: Subscription;

  constructor() {
    effect((onCleanup) => {
      const id = this.authService.getUserId();
      if (id == null) {
        this.perfil.set(null);
        return;
      }
      const sub = this.usuarioService.obtenerPerfil().subscribe({
        next: (u) => this.perfil.set(u),
        error: () => this.perfil.set(null)
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  ngOnInit(): void {
    this.sub = this.searchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(q => {
      const value = (q ?? '').trim();
      this.router.navigate(['/catalogo'], {
        queryParams: { q: value || null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  toggleSearch(): void {
    this.showSearchBar = !this.showSearchBar;
    if (this.showSearchBar) {
      const q = this.route.snapshot.queryParamMap.get('q') ?? '';
      this.searchQuery = q;
    } else {
      this.searchQuery = '';
      this.router.navigate(['/catalogo'], { queryParams: { q: null }, queryParamsHandling: 'merge', replaceUrl: true });
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    this.searchInput$.next(value);
  }

  onSearchSubmit(): void {
    const q = this.searchQuery?.trim();
    if (q) {
      this.router.navigate(['/catalogo'], { queryParams: { q }, queryParamsHandling: 'merge' });
    }
  }

  logout(): void {
    this.showUserMenu = false;
    this.showMobileMenu = false;
    this.authService.logout();
  }
}
