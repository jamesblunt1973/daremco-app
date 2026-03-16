import { Component, inject } from '@angular/core';
import { RegisterParam } from 'src/app/shared/models';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
    standalone: false
})
export class RegisterComponent {
    public loading = false;
    public model: RegisterParam = {
        cell: '',
        name: '',
        password: ''
    };

    private authService = inject(AuthService);

    public async register(): Promise<void> {
        this.loading = true;
        await this.authService.register(this.model);
        this.loading = false;
    }
}
