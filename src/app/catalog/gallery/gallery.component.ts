import { Component, inject, signal } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Attribute, Category, Gallery, Product, ValueEvent } from '../../../app/shared/models';
import { DataService } from '../../../app/shared/services/data.service';
import { AppService } from '../../shared/services/app.service';
import { UpdateService } from '../../shared/services/update.service';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrl: './gallery.component.scss',
    standalone: false
})
export class GalleryComponent {
    public galleries = signal<Gallery[]>([]);
    public products = signal<Product[]>([]);
    public categoryId: string | null = null;
    public galleryId: string | null = null;
    public searchPanelOpen = false;
    public code: number | null = null;
    public name = '';
    public loading = signal(false);

    public app = inject(AppService);
    private data = inject(DataService);
    private update = inject(UpdateService);
    private toastCtrl = inject(ToastController);

    public get categories(): Category[] {
        return this.data.categories.value();
    }

    public get attributes(): Attribute[] {
        if (this.data.primaryData.status() === 'error' || !this.data.primaryData.hasValue()) {
            return [];
        }

        const primaryData = this.data.primaryData.value();
        if (!primaryData?.attributes?.length) {
            return [];
        }

        return primaryData.attributes.filter(a => !a.link && !a.name.startsWith('-'));
    }

    private get allProducts(): Product[] {
        return this.data.products.value();
    }

    public selectCategory(event: CustomEvent): void {
        const category = this.categories.find(a => a.Id === (event.detail as ValueEvent).value);
        if (category?.Galleries) {
            this.galleries.set(category.Galleries);
        }
    }

    public async selectGalley(event: CustomEvent): Promise<void> {
        const galleryId = (event.detail as ValueEvent).value;
        const products = this.allProducts.filter(a => a.GalleryId === galleryId);
        await this.setProducts(products);
    }

    public async search(): Promise<void> {
        if (!this.name && !this.code) {
            return;
        }
        let products = this.allProducts;
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

    public async selectAttribute(id: number): Promise<void> {
        let products = this.allProducts;
        products = products.filter(a => a.AttributeIds && a.AttributeIds.includes(id));
        await this.setProducts(products);
    }

    public resetProduct(): void {
        this.categoryId = null;
        this.galleryId = null;
        this.products.set([]);
    }

    public scrollTop(): void {
        //
    }

    private async setProducts(products: Product[]): Promise<void> {
        if (!products || !products.length) {
            const toast = await this.toastCtrl.create({
                message: 'محصولی یافت نشد',
                duration: 1500,
                position: 'bottom'
            });
            await toast.present();
            return;
        }
        this.loading.set(true);
        const size = '300';
        const productsWithoutImage = products.filter(a => !a.Images || !a.Images[size]);
        if (productsWithoutImage.length) {
            await this.update.updateProductImages(products, size);
        }
        this.products.set(products);
        this.loading.set(false);
    }

    private extractLinksFromHtml = (htmlString: string): HTMLAnchorElement[] => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const anchorElements = Array.from(doc.querySelectorAll('a'));
        return anchorElements;
    };
}
