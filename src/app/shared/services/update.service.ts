import { inject, Injectable } from '@angular/core';
import { FileTransfer } from '@capacitor/file-transfer';
import { Directory, Filesystem, ReadFileResult } from '@capacitor/filesystem';
import { Storage } from '@ionic/storage-angular';
import pLimit from 'p-limit';
import { environment } from '../../../environments/environment';
import { Endpoints, ImageSize, Product } from '../models';
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
        this.app.setMessage(`Start downloading products from ${lastProductId}`);

        const newProducts = await this.api.getProducts(Endpoints.products, lastProductId);
        this.app.setMessage(`New products count: ${newProducts?.length ?? 0}`);
        if (!newProducts?.length) {
            return;
        }

        const updatedProducts = [...savedProducts, ...newProducts];
        await this.setStorage(Endpoints.products, updatedProducts);
    }

    public async updateCategories(): Promise<void> {
        this.app.setMessage('Start downloading categories...');
        const categories = await this.api.getCategories(Endpoints.categories);
        if (!categories || !categories.length) {
            this.app.setMessage('Error loading categories!');
            throw new Error('Error downloading categories.');
        }
        this.app.setMessage('Downloading categories finished.');
        await this.setStorage(Endpoints.categories, categories);
    }

    public async updatePrimaryData(): Promise<void> {
        this.app.setMessage('Start downloading primary data...');
        const data = await this.api.getPrimaryData(Endpoints.primaryData);
        if (!data) {
            this.app.setMessage('Error downloading primary data!');
            throw new Error('Error downloading primary data.');
        }
        this.app.setMessage('Downloading primary data finished.');
        await this.setStorage(Endpoints.primaryData, data);
    }

    public async updateMostUsedLinks(): Promise<void> {
        this.app.setMessage('Start downloading most used links...');
        const data = await this.api.getLinks(Endpoints.mostUsedlinks);
        this.app.setMessage('Downloading most used links finished.');
        if (data && data.length) {
            await this.setStorage(Endpoints.mostUsedlinks, data);
        }
    }

    public async updateProductImages(products: Product[], size: ImageSize): Promise<void> {
        const limit = pLimit(100);
        const updateTasks = products.map(product =>
            limit(async () => ({
                product,
                hasImage: await this.setProductImage(product, size)
            }))
        );

        const updateResults = await Promise.all(updateTasks);

        const productsToDownload = updateResults
            .filter(result => !result.hasImage)
            .map(result => result.product);

        if (productsToDownload.length > 0) {
            await this.updateProductImages(productsToDownload, size);
        }
    }

    public async updateProductColors(): Promise<void> {
        const savedProducts = ((await this.storage.get(Endpoints.products)) as Product[]) || [];
        const missingColors = savedProducts.filter(a => !a.Colors?.length);
        if (!missingColors.length) {
            return;
        }

        const limit = pLimit(100);
        const updateTasks = missingColors.map(product =>
            limit(async () => ({
                product,
                hasColors: await this.setProductColors(product)
            }))
        );

        const updateResults = await Promise.all(updateTasks);

        const updatedProducts = updateResults
            .filter(result => result.hasColors)
            .map(result => result.product);

        if (updatedProducts.length > 0) {
            updatedProducts.forEach(product => {
                const index = savedProducts.findIndex(a => a.Id === product.Id);
                savedProducts[index] = product;
            });
            await this.setStorage(Endpoints.products, savedProducts);
        }

        if (updatedProducts.length < missingColors.length) {
            await this.updateProductColors();
        }
    }

    public async setProductImage(product: Product, size: ImageSize): Promise<boolean | null> {
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
            return true;
        } catch {
            try {
                const url = `${environment.imageUrl}${filePath}`;
                await FileTransfer.downloadFile({
                    ...fileOptions,
                    url
                });
                return null;
            } catch {
                return false;
            }
        }
    }

    public async getProductColors(product: Product): Promise<boolean> {
        const savedProducts = ((await this.storage.get(Endpoints.products)) as Product[]) || [];
        const result = await this.setProductColors(product);
        if (result) {
            const index = savedProducts.findIndex(a => a.Id === product.Id);
            savedProducts[index] = product;
            await this.setStorage(Endpoints.products, savedProducts);
        }
        return result;
    }

    private async setProductColors(product: Product): Promise<boolean> {
        try {
            const colors = await this.api.getProductColors(Endpoints.productColors(product.Id));
            product.Colors = colors;
            return true;
        } catch {
            return false;
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
