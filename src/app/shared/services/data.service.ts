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
        loader: () => this.storage.get(Endpoints.products)
    });

    public primaryData = resource<PrimaryData, unknown>({
        loader: () => this.storage.get(Endpoints.primaryData)
    });

    private storage = inject(Storage);
}
