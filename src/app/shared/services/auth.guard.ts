import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const isAuthenticated = await auth.checkUser();
    if (isAuthenticated) {
        return true;
    }

    return router.createUrlTree(['/auth/login'], {
        queryParams: { redirectUrl: state.url }
    });
};
