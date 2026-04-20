import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-suscripcion-pago-exitoso',
  standalone: true,
  imports: [RouterLink, Navbar],
  template: `
    <div class="min-h-screen bg-bg text-text">
      <app-navbar />
      <main class="max-w-lg mx-auto px-6 pt-32 pb-20 text-center">
        <div class="rounded-3xl border border-success/30 bg-success/10 p-8">
          <div
            class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-emerald-500/15"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-9 w-9 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-success">¡Pago exitoso!</h1>
          <p class="mt-3 text-text-secondary">
            Tu pago se completó correctamente. Ya puedes dirigirte al catálogo. Si el acceso tarda unos segundos en
            activarse, vuelve a intentar o actualiza la página.
          </p>
          <a
            routerLink="/catalogo"
            class="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-semibold"
          >
            Ir al catálogo
          </a>
        </div>
      </main>
    </div>
  `,
})
export class SuscripcionPagoExitoso {}
