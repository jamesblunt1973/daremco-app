import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const tokenKey = 'auth_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const token = localStorage.getItem(tokenKey);

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

            auth.logout();
            void router.navigate(['/login']);

            return throwError(() => err);
        })
    ) as Observable<HttpEvent<unknown>>;
};
