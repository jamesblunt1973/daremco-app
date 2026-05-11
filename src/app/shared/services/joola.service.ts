import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, resource, signal } from '@angular/core';
import { Directory, Filesystem, ReadFileResult } from '@capacitor/filesystem';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JoolaProduct, Product, UserPlan, UserPurchase } from '../models';
import { downloadToFilesystem } from '../utils/download-to-filesystem';
import { AppService } from './app.service';
import { UpdateService } from './update.service';

@Injectable({
    providedIn: 'root'
})
export class JoolaService {
    public static productsPath = `${environment.imageUrl}products/`;
    public loadUserPlans = signal(false);
    public loadUserPurchases = signal(false);
    public loadArchivedPlans = signal(false);

    public userPlans = resource<UserPlan[], unknown>({
        loader: () => {
            if (!this.loadUserPlans()) {
                return Promise.resolve([]);
            }

            return this.initialLoadUserPlans();
        },
        defaultValue: []
    });

    public userPurchases = resource<UserPurchase[], unknown>({
        loader: () => {
            if (!this.loadUserPurchases()) {
                return Promise.resolve([]);
            }

            return this.getUserPurchases();
        },
        defaultValue: []
    });

    public archivedPlans = resource<UserPlan[], unknown>({
        loader: () => {
            if (!this.loadArchivedPlans()) {
                return Promise.resolve([]);
            }

            return this.getArchivedUserPlans();
        },
        defaultValue: []
    });

    public searchedProducts = resource<JoolaProduct[], unknown>({
        loader: () => this.searchProducts(this.productSearchTerm()),
        defaultValue: []
    });

    private apiUrl = `${environment.apiUrl}joola/`;
    private readonly httpClient = inject(HttpClient);
    private readonly app = inject(AppService);
    private readonly storage = inject(Storage);
    private readonly updateService = inject(UpdateService);
    private readonly productSearchTerm = signal('');
    private readonly audioObjectUrls = new Map<string, string>();
    private readonly audioPath = `${environment.baseUrl}files/joola-farsi/`;
    private readonly audioFiles: string[] = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '30',
        '40',
        '50',
        '60',
        '70',
        '80',
        '90',
        '20_',
        '30_',
        '40_',
        '50_',
        '60_',
        '70_',
        '80_',
        '90_',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900',
        '100_',
        '200_',
        '300_',
        '400_',
        '500_',
        '600_',
        '700_',
        '800_',
        '900_',
        '1000',
        '1000_',
        'ela',
        'gereh',
        'raj',
        'rang'
    ];

    public async deleteUserPlan(id: number): Promise<void> {
        await firstValueFrom(this.httpClient.delete<void>(`${this.apiUrl}user-plans/${id}`));
        this.userPlans.update(plans => plans.filter(userPlan => userPlan.id !== id));
    }

    public async addUserPlan(productId: number, raj: number, turned: boolean): Promise<UserPlan> {
        const createdUserPlan = await firstValueFrom(
            this.httpClient.post<UserPlan>(`${this.apiUrl}user-plans`, {
                productId,
                raj,
                turned
            })
        );

        this.userPlans.update(plans => [...plans, createdUserPlan]);
        return createdUserPlan;
    }

    public async addFromArchive(id: number): Promise<UserPlan> {
        const restoredUserPlan = await firstValueFrom(
            this.httpClient.patch<UserPlan>(`${this.apiUrl}user-plans`, id)
        );
        this.userPlans.update(plans => [...plans, restoredUserPlan]);
        return restoredUserPlan;
    }

    public setProductSearchTerm(searchTerm: string): void {
        const normalizedSearchTerm = searchTerm.trim();
        if (this.productSearchTerm() === normalizedSearchTerm) {
            return;
        }

        this.productSearchTerm.set(normalizedSearchTerm);
        this.searchedProducts.reload();
    }

    public async getUserPlanData(id: number): Promise<number[] | null> {
        const planData = (await this.storage.get(`user-plan-${id}`)) as number[];
        if (planData && planData.length) {
            return planData;
        }

        if (!this.app.serverAvailable()) {
            return null;
        }

        try {
            const res = firstValueFrom(
                this.httpClient.get<number[]>(`${this.apiUrl}user-plans/${id}/data`)
            );
            await this.storage.set(`user-plan-${id}`, res);
            return res;
        } catch {
            return null;
        }
    }

    public async loadAudioFiles(): Promise<string[]> {
        return Promise.all(this.audioFiles.map(fileName => this.setAudioFile(fileName)));
    }

    public getAudioUrl(fileName: string): string {
        return this.audioObjectUrls.get(fileName) ?? `${this.audioPath}${fileName}.mp3`;
    }

    public async updateProductImages(userPlans: UserPlan[]): Promise<void> {
        const result = await Promise.all(
            userPlans.map(async up => {
                const p = { Id: up.product.id, Images: up.product.Images } as Product;

                return {
                    p,
                    hasImage: await this.updateService.setProductImage(p, '160')
                };
            })
        );

        result.forEach((element, index) => {
            userPlans[index].product.Images = element.hasImage ? element.p.Images : {};
        });
    }

    private async searchProducts(searchTerm: string): Promise<JoolaProduct[]> {
        if (searchTerm.length <= 2) {
            return [];
        }

        const params = new HttpParams().set('str', searchTerm);
        return await firstValueFrom(
            this.httpClient.get<JoolaProduct[]>(`${this.apiUrl}search-products`, { params })
        );
    }

    private getUserPurchases(): Promise<UserPurchase[]> {
        return firstValueFrom(this.httpClient.get<UserPurchase[]>(`${this.apiUrl}user-purchases`));
    }

    private getArchivedUserPlans(): Promise<UserPlan[]> {
        return firstValueFrom(
            this.httpClient.get<UserPlan[]>(`${this.apiUrl}user-plans?finished=true`)
        );
    }

    private async initialLoadUserPlans(): Promise<UserPlan[]> {
        if (!this.app.serverAvailable()) {
            const storedUserPlans = (await this.storage.get('user-plans')) as UserPlan[];
            return storedUserPlans ?? [];
        }

        const userPlans = firstValueFrom(
            this.httpClient.get<UserPlan[]>(`${this.apiUrl}user-plans?finished=false`)
        );

        await this.storage.set('user-plans', userPlans);
        return userPlans;
    }

    private preloadAudio(fileName: string): Promise<string> {
        const audio = new Audio(this.getAudioUrl(fileName));
        return new Promise(resolve => {
            audio.addEventListener('canplaythrough', () => resolve(fileName), { once: true });
        });
    }

    private async setAudioFile(fileName: string): Promise<string> {
        const fileOptions = {
            path: `${fileName}.mp3`,
            directory: Directory.Data
        };

        try {
            const audioData = await Filesystem.readFile(fileOptions);
            this.updateAudioObjectUrl(fileName, audioData);
            return this.preloadAudio(fileName);
        } catch {
            const serverAvailable = this.app.serverAvailable();
            if (!serverAvailable) {
                return this.preloadAudio(fileName);
            }

            try {
                const url = `${this.audioPath}${fileName}.mp3`;
                await downloadToFilesystem({ ...fileOptions, url });

                const downloadedAudioData = await Filesystem.readFile(fileOptions);
                this.updateAudioObjectUrl(fileName, downloadedAudioData);
                return this.preloadAudio(fileName);
            } catch {
                return this.preloadAudio(fileName);
            }
        }
    }

    private updateAudioObjectUrl(fileName: string, audioData: ReadFileResult): void {
        const previousAudioUrl = this.audioObjectUrls.get(fileName);
        if (previousAudioUrl) {
            URL.revokeObjectURL(previousAudioUrl);
        }

        this.audioObjectUrls.set(fileName, this.getAudioObjectUrl(audioData));
    }

    private getAudioObjectUrl(audioData: ReadFileResult): string {
        if (typeof audioData.data === 'string') {
            const byteCharacters = atob(audioData.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mpeg' });

            return URL.createObjectURL(blob);
        } else {
            return URL.createObjectURL(audioData.data);
        }
    }

    private async savePreferences(userPlan: UserPlan): Promise<void> {
        const { id, position, autoPlay, speed, playSound } = userPlan;
        const data = { id, position, autoPlay, speed, playSound };

        await this.storage.set(`user-plan-setting-${id}`, data);

        if (this.app.serverAvailable()) {
            await firstValueFrom(this.httpClient.patch<void>(`${this.apiUrl}save`, data));
        }
    }
}
