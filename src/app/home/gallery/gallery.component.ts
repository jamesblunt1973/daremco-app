import { Component, inject, input, signal } from '@angular/core';
import { Gallery, Product, ValueEvent } from '../../../app/shared/models';
import { DataService } from '../../../app/shared/services/data.service';

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
}
