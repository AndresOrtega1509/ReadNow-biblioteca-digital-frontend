import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';


export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing').then(m => m.Landing) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'registro', loadComponent: () => import('./pages/registro/registro').then(m => m.Registro) },
  { path: 'verificar', loadComponent: () => import('./pages/verificacion/verificacion').then(m => m.Verificacion) },
  { path: 'recuperar-password', loadComponent: () => import('./pages/recuperar-password/recuperar-password').then(m => m.RecuperarPassword) },
  { path: 'restablecer-password', loadComponent: () => import('./pages/restablecer-password/restablecer-password').then(m => m.RestablecerPassword) },
  { path: 'catalogo', loadComponent: () => import('./pages/catalogo/catalogo').then(m => m.Catalogo), canActivate: [authGuard] },
  { path: 'catalogo/:id', loadComponent: () => import('./pages/recurso-detalle/recurso-detalle').then(m => m.RecursoDetalle), canActivate: [authGuard] },
  { path: 'favoritos', loadComponent: () => import('./pages/favoritos/favoritos').then(m => m.Favoritos), canActivate: [authGuard] },
  { path: 'historial', loadComponent: () => import('./pages/historial/historial').then(m => m.Historial), canActivate: [authGuard] },
  { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil), canActivate: [authGuard] },
  { path: 'admin/recursos', loadComponent: () => import('./pages/admin-recursos/admin-recursos').then(m => m.AdminRecursos), canActivate: [adminGuard] },
  { path: 'admin/estadisticas', loadComponent: () => import('./pages/admin-estadisticas/admin-estadisticas').then(m => m.AdminEstadisticas), canActivate: [adminGuard] },
  { path: '**', redirectTo: '' },
];
