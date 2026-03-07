import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/landing/landing').then(m => m.Landing) },
    { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
    { path: 'registro', loadComponent: () => import('./pages/registro/registro').then(m => m.Registro) },
    { path: 'verificar', loadComponent: () => import('./pages/verificacion/verificacion').then(m => m.Verificacion) },
    { path: 'recuperar-password', loadComponent: () => import('./pages/recuperar-password/recuperar-password').then(m => m.RecuperarPassword) },
    { path: 'restablecer-password', loadComponent: () => import('./pages/restablecer-password/restablecer-password').then(m => m.RestablecerPassword) },

    { path: '**', redirectTo: '' },
];
