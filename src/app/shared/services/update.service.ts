import { inject, Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Storage } from '@ionic/storage-angular';
import pLimit from 'p-limit';
import { environment } from '../../../environments/environment';
import { Endpoints, Product } from '../models';
import { ApiService } from './api.service';
import { AppService } from './app.service';

@Injectable({
    providedIn: 'root'
})
export class UpdateService {
    private api = inject(ApiService);
    private app = inject(AppService);
    private storage = inject(Storage);

    public async updateProducts(): Promise<void> {
        const savedProducts = ((await this.storage.get(Endpoints.products)) as Product[]) || [];
        const lastProductId = savedProducts.length ? savedProducts[savedProducts.length - 1].Id : 0;

        const newProducts = await this.api.getProducts(Endpoints.products, lastProductId);
        if (!newProducts?.length) {
            return;
        }

        const updatedProducts = [...savedProducts, ...newProducts];
        await this.setStorage(Endpoints.products, updatedProducts);
    }

    public async updateCategories(): Promise<void> {
        const categories = await this.api.getCategories(Endpoints.categories);
        await this.setStorage(Endpoints.categories, categories);
    }

    public async updatePrimaryData(): Promise<void> {
        const data = await this.api.getPrimaryData(Endpoints.primaryData);
        await this.setStorage(Endpoints.primaryData, data);
    }

    public async updateProductImages(products: Product[]): Promise<void> {
        this.app.isUpdating.set(true);

        const limit = pLimit(100);
        const updateTasks = products.map(product =>
            limit(async () => ({
                product,
                hasImage: await this.setProductImage(product)
            }))
        );

        const updateResults = await Promise.all(updateTasks);

        const productsToDownload = updateResults
            .filter(result => !result.hasImage)
            .map(result => result.product);

        if (productsToDownload.length > 0) {
            await this.updateProductImages(productsToDownload);
        }
        this.app.isUpdating.set(false);
    }

    private async setStorage(key: string, data: unknown): Promise<void> {
        await this.storage.set(key, data);
    }

    private async setProductImage(product: Product): Promise<boolean> {
        const fileName = `${product.Id}.jpg`;
        const filePath = `products/${product.Id}/300.jpg`;
        const fileOptions = {
            path: fileName,
            directory: Directory.Data
        };

        this.app.processedImages.update(value => ++value);
        try {
            const imageData = await Filesystem.readFile(fileOptions);
            product.ImageData = URL.createObjectURL(imageData.data as Blob);
            return true;
        } catch {
            try {
                const res = await Filesystem.downloadFile({
                    ...fileOptions,
                    url: `${environment.imageUrl}${filePath}`
                });
                product.ImageData = URL.createObjectURL(res as Blob);
                return true;
            } catch {
                return false;
            }
        }
    }
}
