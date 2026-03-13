import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AuthLayoutComponent } from './layout/auth-layout';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'login' },
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent }
        ]
    }
];

@NgModule({
    declarations: [LoginComponent, RegisterComponent, AuthLayoutComponent],
    imports: [SharedModule, RouterModule.forChild(routes)]
})
export class AuthModule {}
