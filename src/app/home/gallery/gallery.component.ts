import { Component, inject, input, signal } from '@angular/core';
import { Gallery, Product, ValueEvent } from '../../../app/shared/models';
import { DataService } from '../../../app/shared/services/data.service';
import { AppService } from '../../shared/services/app.service';
import { UpdateService } from '../../shared/services/update.service';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    standalone: false
})
export class GalleryComponent {
    public allProducts = input.required<Product[]>();
    public categories;
    public galleries = signal<Gallery[]>([]);
    public products = signal<Product[]>([]);
    public categoryId: string | null = null;
    public galleryId: string | null = null;
    public searchPanelOpen = false;
    public code: number | null = null;
    public name = '';

    public app = inject(AppService);
    private data = inject(DataService);
    private update = inject(UpdateService);

    public constructor() {
        this.categories = this.data.categories;
    }

    public selectCategory(event: CustomEvent): void {
        const category = this.categories
            .value()
            .find(a => a.Id === (event.detail as ValueEvent).value);
        if (category?.Galleries) {
            this.galleries.set(category?.Galleries);
        }
    }

    public async selectGalley(event: CustomEvent): Promise<void> {
        const galleryId = (event.detail as ValueEvent).value;
        const products = this.allProducts().filter(a => a.GalleryId === galleryId);
        await this.setProducts(products);
    }

    public async search(): Promise<void> {
        if (!this.name && !this.code) {
            return;
        }
        let products = this.allProducts();
        if (this.name) {
            products = products.filter(a => a.Name.includes(this.name));
        }
        if (this.code) {
            products = products.filter(a => a.Id === this.code);
        }
        await this.setProducts(products);
        this.categoryId = null;
        this.galleryId = null;
        this.name = '';
        this.code = null;
        this.searchPanelOpen = false;
    }

    private async setProducts(products: Product[]): Promise<void> {
        if (!products || !products.length) {
            return;
        }
        const productsWithoutImage = products.filter(a => !a.Images || !a.Images['300']);
        if (productsWithoutImage.length) {
            await this.update.updateProductImages(products);
        }
        this.products.set(products);
    }
}
