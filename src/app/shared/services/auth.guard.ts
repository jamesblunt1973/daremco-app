import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.user()) {
        return true;
    }

    const isAuthenticated = await auth.checkUser();
    if (isAuthenticated) {
        return true;
    }

    return router.createUrlTree(['/login'], {
        queryParams: { redirectUrl: state.url }
    });
};
