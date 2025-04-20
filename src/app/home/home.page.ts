import { Component, computed, effect, inject } from '@angular/core';
import { AppService } from '../shared/services/app.service';
import { DataService } from '../shared/services/data.service';
import { UpdateService } from '../shared/services/update.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: false
})
export class HomePage {
    public data = inject(DataService);
    public update = inject(UpdateService);
    public app = inject(AppService);

    public categories = this.data.categories;
    public products = this.data.products;
    public primaryData = this.data.primaryData;
    public progress = computed(() => ({
        percent: this.app.hasImages() / this.app.productsCount(),
        buffer: (this.app.hasImages() + this.app.downloadedImages()) / this.app.productsCount()
    }));

    public constructor() {
        effect(() => {
            if (!this.products.hasValue()) {
                return;
            }
            void this.update.updateProductImages();
        });
    }
}
