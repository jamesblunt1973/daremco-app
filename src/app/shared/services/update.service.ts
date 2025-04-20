/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { inject, Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Storage } from '@ionic/storage-angular';
import pLimit from 'p-limit';
import { environment } from 'src/environments/environment';
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

    public async updateProductImages(): Promise<void> {
        const products = (await this.storage.get(Endpoints.products)) as Product[];
        this.app.productsCount.set(products.length);
        this.app.hasImages.set(0);
        this.app.missedImages.set(0);
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

        this.app.downloadedImages.set(0);
        this.app.failedImages.set(0);

        if (productsToDownload.length > 0) {
            await this.downloadImages(productsToDownload);
        }
        this.app.hasImages.update(value => value + this.app.downloadedImages());
        this.app.downloadedImages.set(0);

        if (this.app.failedImages() > 0) {
            await this.updateProductImages();
        }
        this.app.isUpdating.set(false);
    }

    private async setStorage(key: string, data: unknown): Promise<void> {
        await this.storage.set(key, data);
    }

    private async downloadImages(products: Product[]): Promise<void> {
        await Promise.all(products.map(product => this.downloadProductImage(product)));
    }

    private async downloadProductImage(product: Product): Promise<void> {
        const fileName = `${product.Id}.jpg`;
        const filePath = `products/${product.Id}/300.jpg`;
        const fileOptions = {
            path: fileName,
            directory: Directory.Data
        };

        try {
            await Filesystem.stat(fileOptions);
        } catch {
            try {
                await Filesystem.downloadFile({
                    ...fileOptions,
                    url: `${environment.imageUrl}${filePath}`
                });
                this.app.downloadedImages.update(value => ++value);
            } catch {
                this.app.failedImages.update(value => ++value);
            }
        }
    }

    private async setProductImage(product: Product): Promise<boolean> {
        const fileName = `${product.Id}.jpg`;
        const fileOptions = {
            path: fileName,
            directory: Directory.Data
        };
        try {
            const imageData = await Filesystem.readFile(fileOptions);
            product.ImageData = URL.createObjectURL(imageData.data as Blob);
            this.app.hasImages.update(value => ++value);
            return true;
        } catch {
            product.ImageData = '';
            this.app.missedImages.update(value => ++value);
            return false;
        }
    }
}
