import { inject, Injectable } from '@angular/core';
import { Directory, Filesystem, ReadFileResult } from '@capacitor/filesystem';
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
        this.app.message.set(`Start downloading products from ${lastProductId}`);

        const newProducts = await this.api.getProducts(Endpoints.products, lastProductId);
        this.app.message.set(`New products count: ${newProducts.length}`);
        if (!newProducts?.length) {
            return;
        }

        const updatedProducts = [...savedProducts, ...newProducts];
        await this.setStorage(Endpoints.products, updatedProducts);
    }

    public async updateCategories(): Promise<void> {
        this.app.message.set('Start downloading categories...');
        const categories = await this.api.getCategories(Endpoints.categories);
        this.app.message.set('Downloading categories finished.');
        await this.setStorage(Endpoints.categories, categories);
    }

    public async updatePrimaryData(): Promise<void> {
        this.app.message.set('Start downloading primary data...');
        const data = await this.api.getPrimaryData(Endpoints.primaryData);
        this.app.message.set('Downloading primary data finished.');
        await this.setStorage(Endpoints.primaryData, data);
    }

    public async updateProductImages(products: Product[]): Promise<void> {
        const limit = pLimit(100);
        const updateTasks = products.map(product =>
            limit(async () => ({
                product,
                hasImage: await this.setProductImage(product, '300')
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

    public async setProductImage(product: Product, size: string): Promise<boolean | null> {
        const fileName = `${product.Id}_${size}.jpg`;
        const filePath = `products/${product.Id}/${size}.jpg`;
        const fileOptions = {
            path: fileName,
            directory: Directory.Data
        };

        try {
            const imageData = await Filesystem.readFile(fileOptions);
            const imageObjUrl = this.getImageObjectUrl(imageData);
            product.Images = product.Images
                ? {
                      ...product.Images,
                      [size]: imageObjUrl
                  }
                : {
                      [size]: imageObjUrl
                  };
            this.app.processedImages.update(value => ++value);
            return true;
        } catch {
            try {
                const url = `${environment.imageUrl}${filePath}`;
                await Filesystem.downloadFile({
                    ...fileOptions,
                    url
                });
                return null;
            } catch {
                return false;
            }
        }
    }

    private async setStorage(key: string, data: unknown): Promise<void> {
        await this.storage.set(key, data);
    }

    private getImageObjectUrl(imageData: ReadFileResult): string {
        if (typeof imageData.data === 'string') {
            const byteCharacters = atob(imageData.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            return URL.createObjectURL(blob);
        } else {
            return URL.createObjectURL(imageData.data);
        }
    }
}
