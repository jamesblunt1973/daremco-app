import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, UserPlan, UserPurchase } from '../models';

@Injectable({
    providedIn: 'root'
})
export class JoolaService {
    public productsPath = `${environment.imageUrl}products/`;
    public audioPath = './assets/joola-farsi/';

    private apiUrl = `${environment.apiUrl}joola/`;
    private httpClient = inject(HttpClient);
    private userPlans$ = new BehaviorSubject<UserPlan[]>([]);

    private audioFiles: string[] = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
        '20', '30', '40', '50', '60', '70', '80', '90',
        '20_', '30_', '40_', '50_', '60_', '70_', '80_', '90_',
        '100', '200', '300', '400', '500', '600', '700', '800', '900',
        '100_', '200_', '300_', '400_', '500_', '600_', '700_', '800_', '900_',
        '1000', '1000_', 'ela', 'gereh', 'raj', 'rang'
    ];

    public async initialLoadUserPlans(): Promise<UserPlan[]> {
        const userPlans = await firstValueFrom(
            this.httpClient.get<UserPlan[]>(`${this.apiUrl}user-plans?finished=false`)
        );
        this.userPlans$.next(userPlans);
        return userPlans;
    }

    public getUserPlans(): Observable<UserPlan[]> {
        return this.userPlans$.asObservable();
    }

    public async deleteUserPlan(id: number): Promise<void> {
        await firstValueFrom(this.httpClient.delete<void>(`${this.apiUrl}user-plans/${id}`));
        this.userPlans$.next(this.userPlans$.value.filter(userPlan => userPlan.id !== id));
    }

    public async addUserPlan(productId: number, raj: number, turned: boolean): Promise<UserPlan> {
        const createdUserPlan = await firstValueFrom(
            this.httpClient.post<UserPlan>(`${this.apiUrl}user-plans`, {
                productId,
                raj,
                turned
            })
        );

        this.userPlans$.next([...this.userPlans$.value, createdUserPlan]);
        return createdUserPlan;
    }

    public getUserPurchases(): Promise<UserPurchase[]> {
        return firstValueFrom(this.httpClient.get<UserPurchase[]>(`${this.apiUrl}user-purchases`));
    }

    public getArchivedUserPlans(): Promise<UserPlan[]> {
        return firstValueFrom(this.httpClient.get<UserPlan[]>(`${this.apiUrl}user-plans?finished=true`));
    }

    public async addFromArchive(id: number): Promise<UserPlan> {
        const restoredUserPlan = await firstValueFrom(
            this.httpClient.patch<UserPlan>(`${this.apiUrl}user-plans`, id)
        );
        this.userPlans$.next([...this.userPlans$.value, restoredUserPlan]);
        return restoredUserPlan;
    }

    public searchProducts(searchTerm: string): Promise<Product[]> {
        const params = new HttpParams().set('str', searchTerm);
        return firstValueFrom(this.httpClient.get<Product[]>(`${this.apiUrl}search-products`, { params }));
    }

    public getUserPlanData(id: number): Promise<number[]> {
        return firstValueFrom(this.httpClient.get<number[]>(`${this.apiUrl}user-plans/${id}/data`));
    }

    public async loadAudioFiles(): Promise<string[]> {
        return Promise.all(this.audioFiles.map(fileName => this.preloadAudio(fileName)));
    }

    public async savePosition(id: number, position: number): Promise<void> {
        await this.savePreference('save-position', { id, position });
    }

    public async saveSpeed(id: number, speed: number): Promise<void> {
        await this.savePreference('save-speed', { id, speed });
    }

    public async savePlaySound(id: number, playSound: boolean): Promise<void> {
        await this.savePreference('save-play-sound', { id, playSound });
    }

    private preloadAudio(fileName: string): Promise<string> {
        const audio = new Audio(`${this.audioPath}${fileName}.mp3`);
        return new Promise(resolve => {
            audio.addEventListener('canplaythrough', () => resolve(fileName), { once: true });
        });
    }

    private async savePreference(endpoint: string, payload: Record<string, unknown>): Promise<void> {
        try {
            await firstValueFrom(this.httpClient.post<void>(`${this.apiUrl}${endpoint}`, payload));
        } catch (error: unknown) {
            throw error;
        }
    }
}
