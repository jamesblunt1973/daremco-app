import { Component, effect, inject } from '@angular/core';
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

    public products = this.data.products;

    public constructor() {
        effect(() => {
            if (!this.products.hasValue()) {
                return;
            }
            const products = this.products.value();
            this.app.productsCount.set(products.length);
            void this.update.updateProductImages(products);
        });
    }
}
