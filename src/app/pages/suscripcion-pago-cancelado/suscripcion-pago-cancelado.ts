import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-suscripcion-pago-cancelado',
  standalone: true,
  imports: [RouterLink, Navbar],
  template: `
    <div class="min-h-screen bg-bg text-text">
      <app-navbar />
      <main class="max-w-lg mx-auto px-6 pt-32 pb-20 text-center">
        <div class="rounded-3xl border border-border bg-surface p-8">
          <div
            class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500/50 bg-red-500/10"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-9 w-9 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.25"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold">Pago rechazado</h1>
          <p class="mt-3 text-text-secondary">No se realizó ningún cargo. Puedes elegir otro plan cuando quieras.</p>
          <a
            routerLink="/suscripcion/planes"
            class="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-semibold"
          >
            Volver a planes
          </a>
        </div>
      </main>
    </div>
  `,
})
export class SuscripcionPagoCancelado {}
