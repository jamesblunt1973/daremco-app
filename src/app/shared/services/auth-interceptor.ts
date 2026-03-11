import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { AUTH_TOKEN_KEY, AuthService } from './auth.service';

const AUTH_ENDPOINTS_TO_SKIP_REDIRECT = ['/auth/login', '/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const isAuthEndpoint = AUTH_ENDPOINTS_TO_SKIP_REDIRECT.some(endpoint =>
        req.url.includes(endpoint)
    );

    const request = token
        ? req.clone({
              setHeaders: { Authorization: `Bearer ${token}` }
          })
        : req;

    return next(request).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status !== 401) {
                return throwError(() => err);
            }

            if (isAuthEndpoint) {
                return throwError(() => err);
            }

            auth.logout();
            if (router.url !== '/login') {
                void router.navigate(['/login']);
            }

            return throwError(() => err);
        })
    ) as Observable<HttpEvent<unknown>>;
};
