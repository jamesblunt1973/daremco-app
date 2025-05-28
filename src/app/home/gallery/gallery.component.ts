import { Component, inject, signal } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Attribute, Category, Gallery, Product, ValueEvent } from '../../../app/shared/models';
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
    public allProducts: Product[];
    public categories: Category[];
    public mostUsedLinks: HTMLAnchorElement[];
    public attributes: Attribute[];
    public galleries = signal<Gallery[]>([]);
    public products = signal<Product[]>([]);
    public categoryId: string | null = null;
    public galleryId: string | null = null;
    public searchPanelOpen = false;
    public code: number | null = null;
    public name = '';
    public loading = false;

    public app = inject(AppService);
    private data = inject(DataService);
    private update = inject(UpdateService);
    private toastController = inject(ToastController);

    public constructor() {
        this.allProducts = this.data.products.value();
        this.categories = this.data.categories.value();

        this.attributes = [];
        const primaryData = this.data.primaryData.value();
        if (primaryData && primaryData.attributes && primaryData.attributes.length) {
            this.attributes = primaryData.attributes.filter(a => !a.link);
        }

        this.mostUsedLinks = [];
        const links = this.data.mostUsedlinks.value();
        if (links) {
            this.mostUsedLinks = this.extractLinksFromHtml(links);
        }
    }

    public selectCategory(event: CustomEvent): void {
        const category = this.categories.find(a => a.Id === (event.detail as ValueEvent).value);
        if (category?.Galleries) {
            this.galleries.set(category?.Galleries);
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
            const toast = await this.toastController.create({
                message: 'محصولی یافت نشد',
                duration: 1500,
                position: 'bottom'
            });
            await toast.present();
            return;
        }
        this.loading = true;
        const productsWithoutImage = products.filter(a => !a.Images || !a.Images['300']);
        if (productsWithoutImage.length) {
            await this.update.updateProductImages(products);
        }
        this.products.set(products);
        this.loading = false;
    }

    private extractLinksFromHtml = (htmlString: string): HTMLAnchorElement[] => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const anchorElements = Array.from(doc.querySelectorAll('a'));
        return anchorElements;
    };
}
