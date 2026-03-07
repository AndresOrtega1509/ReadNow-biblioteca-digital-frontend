import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UsuarioService } from '../service/usuario.service';
import { SuscripcionRedirectService } from '../service/suscripcion-redirect.service';

/** Bloquea el acceso al catálogo si la suscripción está vencida. Redirige a perfil (URL limpia). */
export const suscripcionGuard: CanActivateFn = () => {
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);
  const suscripcionRedirect = inject(SuscripcionRedirectService);

  return usuarioService.puedeAccederAlCatalogo().pipe(
    map((puede) => {
      if (puede) return true;
      suscripcionRedirect.marcarRedirectPorVencida();
      router.navigate(['/perfil']);
      return false;
    }),
    catchError(() => {
      suscripcionRedirect.marcarRedirectPorVencida();
      router.navigate(['/perfil']);
      return of(false);
    })
  );
};
