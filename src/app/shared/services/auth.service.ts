import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResult, LoginParam, RegisterParam, TokenData, User } from '../models';

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

        try {
            const user = this.extractToken(token);
            this.userSignal.set(user);
            return Promise.resolve(true);
        } catch {
            localStorage.removeItem(this.tokenKey);
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

    private extractToken(token: string): User {
        const base64Str = token.split('.')[1];
        const base64 = base64Str.replace(/-/g, '+').replace(/_/g, '/');
        const payload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const jsonObj = JSON.parse(payload) as TokenData;
        const mobilePhoneKey = Object.keys(jsonObj).find(a => a.indexOf('mobilephone') > -1);
        return {
            id: +jsonObj.nameid,
            name: jsonObj.unique_name,
            gender: eval(jsonObj.gender.toLowerCase()) as boolean,
            cell: mobilePhoneKey ? (jsonObj[mobilePhoneKey] as string) : '',
            userPlans: []
        };
    }
}
