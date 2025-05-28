import { inject, Injectable, resource } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Category, Endpoints, PrimaryData, Product } from '../models';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    public categories = resource<Category[], unknown>({
        loader: () => this.storage.get(Endpoints.categories),
        defaultValue: []
    });

    public products = resource<Product[], unknown>({
        loader: () => this.storage.get(Endpoints.products),
        defaultValue: []
    });

    public primaryData = resource<PrimaryData, unknown>({
        loader: () => this.storage.get(Endpoints.primaryData)
    });

    public mostUsedlinks = resource<string, unknown>({
        loader: () => this.storage.get(Endpoints.mostUsedlinks),
        defaultValue: ''
    });

    private storage = inject(Storage);

    public reload = (): void => {
        this.categories.reload();
        this.products.reload();
        this.primaryData.reload();
    };
}
