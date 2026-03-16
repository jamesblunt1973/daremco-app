import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginParam } from '../../shared/models';
import { AuthService } from '../../shared/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    standalone: false
})
export class LoginComponent {
    public loading = false;
    public model: LoginParam = {
        password: '',
        userName: ''
    };

    private readonly authService = inject(AuthService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    public async login(): Promise<void> {
        if (this.loading) {
            return;
        }

        this.loading = true;

        try {
            await this.authService.login(this.model);

            const redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl');
            const targetUrl = redirectUrl?.startsWith('/') ? redirectUrl : '/joola';

            await this.router.navigateByUrl(targetUrl);
        } finally {
            this.loading = false;
        }
    }
}
