import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { SuscripcionService } from '../../core/service/suscripcion.service';
import { SuscripcionPlanesCatalogo, SuscripcionPlanItem } from '../../core/models/interfaces';

@Component({
  selector: 'app-suscripcion-planes',
  standalone: true,
  imports: [Navbar, Footer],
  templateUrl: './suscripcion-planes.html',
})
export class SuscripcionPlanes implements OnInit {
  loading = signal(true);
  error = signal('');
  catalogo = signal<SuscripcionPlanesCatalogo | null>(null);
  checkoutLoading = signal<string | null>(null);
  pruebaLoading = signal(false);
  portalLoading = signal(false);

  constructor(
    private suscripcionService: SuscripcionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');
    this.suscripcionService.obtenerPlanes().subscribe({
      next: (c) => {
        this.catalogo.set(c);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'No se pudieron cargar los planes.');
        this.loading.set(false);
      },
    });
  }

  formatoCop(valor: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  }

  etiquetaDuracion(plan: SuscripcionPlanItem): string {
    const m = plan.duracionMeses;
    if (m === 1) return '1 mes';
    if (m === 12) return '1 año';
    return `${m} meses`;
  }

  activarPrueba(): void {
    this.pruebaLoading.set(true);
    this.error.set('');
    this.suscripcionService.activarPruebaGratuita().subscribe({
      next: (res) => {
        this.pruebaLoading.set(false);
        if (res.exitoso) {
          this.router.navigate(['/catalogo']);
        } else {
          this.error.set(res.mensaje || 'No se pudo activar la prueba.');
        }
      },
      error: (err) => {
        this.pruebaLoading.set(false);
        this.error.set(err.error?.mensaje || 'No se pudo activar la prueba gratuita.');
      },
    });
  }

  pagar(plan: SuscripcionPlanItem): void {
    if (!plan.stripeConfigurado) {
      this.error.set('Este plan no tiene un Price ID válido (debe empezar por price_... en application.properties). No uses el ID del producto (prod_...).');
      return;
    }
    this.checkoutLoading.set(plan.codigoPlan);
    this.error.set('');
    this.suscripcionService.crearCheckout(plan.codigoPlan).subscribe({
      next: (session) => {
        this.checkoutLoading.set(null);
        if (session.url) {
          window.location.href = session.url;
        }
      },
      error: (err) => {
        this.checkoutLoading.set(null);
        this.error.set(err.error?.mensaje || 'No se pudo iniciar el pago.');
      },
    });
  }

  abrirPortal(): void {
    this.portalLoading.set(true);
    this.error.set('');
    this.suscripcionService.abrirPortalGestion().subscribe({
      next: (r) => {
        this.portalLoading.set(false);
        if (r.url) {
          window.location.href = r.url;
        }
      },
      error: (err) => {
        this.portalLoading.set(false);
        this.error.set(err.error?.mensaje || 'No se pudo abrir el portal de gestión.');
      },
    });
  }
}
