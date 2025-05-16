import { Component, inject, input, signal } from '@angular/core';
import { Gallery, Product, ValueEvent } from '../../../app/shared/models';
import { DataService } from '../../../app/shared/services/data.service';

type IonInput = string | number | null | undefined;

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

    private data = inject(DataService);

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

    public selectGalley(event: CustomEvent): void {
        const galleryId = (event.detail as ValueEvent).value;
        const products = this.allProducts().filter(a => a.GalleryId === galleryId);
        if (products) {
            this.products.set(products);
        }
    }

    public search(name: IonInput, code: IonInput): void {
        if (!name && !code) {
            return;
        }
        let products = this.allProducts();
        if (name) {
            products = products.filter(a => a.Name.includes(name.toString()));
        }
        if (code) {
            products = products.filter(a => a.Id == code);
        }
        this.products.set(products);
        this.categoryId = null;
        this.galleryId = null;
        this.searchPanelOpen = false;
    }
}
