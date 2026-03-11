import { Component, inject } from '@angular/core';
import { LoginParam } from 'src/app/shared/models';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent {
    public loading = false;
    public model: LoginParam = {
        password: '',
        userName: ''
    };

    private readonly authService = inject(AuthService);

    public async login(): Promise<void> {
        this.loading = true;
        await this.authService.login(this.model);
        this.loading = false;
    }
}
