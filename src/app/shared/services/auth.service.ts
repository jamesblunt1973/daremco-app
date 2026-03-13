import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResult, LoginParam, RegisterParam, User } from '../models';

export const AUTH_TOKEN_KEY = 'auth_token';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public user = computed(() => this.userSignal());

    private userSignal = signal<User | null>(null);
    private readonly tokenKey = AUTH_TOKEN_KEY;

    private apiUrl = `${environment.apiUrl}auth/`;
    private http = inject(HttpClient);

    public register(data: RegisterParam): Promise<AuthResult> {
        const res = this.http.post<AuthResult>(`${this.apiUrl}register`, data).pipe(
            tap(res => {
                localStorage.setItem(this.tokenKey, res.token);
                this.userSignal.set(res.user);
            })
        );

        return firstValueFrom(res);
    }

    public login(data: LoginParam): Promise<AuthResult> {
        const res = this.http.post<AuthResult>(`${this.apiUrl}login`, data).pipe(
            tap(res => {
                localStorage.setItem(this.tokenKey, res.token);
                this.userSignal.set(res.user);
            })
        );

        return firstValueFrom(res);
    }

    public logout(): void {
        localStorage.removeItem(this.tokenKey);
        this.userSignal.set(null);
    }

    public checkUser(): Promise<boolean> {
        if (this.user()) {
            return Promise.resolve(true);
        }

        const token = localStorage.getItem(this.tokenKey);
        if (!token) {
            return Promise.resolve(false);
        }

        const res = this.http.get<AuthResult>(`${this.apiUrl}check-user`).pipe(
            tap(res => {
                localStorage.setItem(this.tokenKey, res.token);
                this.userSignal.set(res.user);
            }),
            map(() => true),
            catchError(() => {
                this.logout();
                return of(false);
            })
        );

        return firstValueFrom(res);
    }
}
