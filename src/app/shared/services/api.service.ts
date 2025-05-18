import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, PrimaryData, Product, ProductColor } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;
    private httpClient = inject(HttpClient);

    public healthCheck(): Promise<string> {
        return firstValueFrom(
            this.httpClient.get(`${environment.baseUrl}health`, { responseType: 'text' })
        );
    }

    public getCategories(endpoint: string): Promise<Category[]> {
        return firstValueFrom(this.httpClient.get<Category[]>(`${this.apiUrl}${endpoint}`));
    }

    public getProducts(endpoint: string, lastId: number): Promise<Product[]> {
        return firstValueFrom(
            this.httpClient.get<Product[]>(`${this.apiUrl}${endpoint}/${lastId}`)
        );
    }

    public getPrimaryData(endpoint: string): Promise<PrimaryData> {
        return firstValueFrom(this.httpClient.get<PrimaryData>(`${this.apiUrl}${endpoint}`));
    }

    public getProductColors(endpoint: string): Promise<ProductColor[]> {
        return firstValueFrom(this.httpClient.get<ProductColor[]>(`${this.apiUrl}${endpoint}`));
    }
}
