import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
    { path: 'registro', loadComponent: () => import('./pages/registro/registro').then(m => m.Registro) },
    { path: 'verificar', loadComponent: () => import('./pages/verificacion/verificacion').then(m => m.Verificacion) },
    { path: 'recuperar-password', loadComponent: () => import('./pages/recuperar-password/recuperar-password').then(m => m.RecuperarPassword) },

    { path: '**', redirectTo: '' },
];
