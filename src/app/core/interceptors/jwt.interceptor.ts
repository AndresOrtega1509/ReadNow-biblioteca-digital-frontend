import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const handle = (r: typeof req) =>
    next(r).pipe(
      catchError((err: HttpErrorResponse) => {
        const msg = (err.error?.mensaje ?? '').toString().toLowerCase();
        if (err.status === 403 && msg.includes('desactivada')) {
          auth.logoutCuentaDesactivada();
        }
        return throwError(() => err);
      })
    );

  const token = localStorage.getItem('token');
  if (token) {
    return handle(
      req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    );
  }

  return handle(req);
};
