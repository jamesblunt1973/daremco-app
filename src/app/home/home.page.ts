import { Component, effect, inject, OnInit } from '@angular/core';
import { Network } from '@capacitor/network';
import { Storage } from '@ionic/storage-angular';
import { ServerStatus } from '../shared/models/types/server-status';
import { ApiService } from '../shared/services/api.service';
import { AppService } from '../shared/services/app.service';
import { DataService } from '../shared/services/data.service';
import { UpdateService } from '../shared/services/update.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: false
})
export class HomePage implements OnInit {
    public data = inject(DataService);
    public update = inject(UpdateService);
    public app = inject(AppService);
    public storage = inject(Storage);
    public api = inject(ApiService);

    public products = this.data.products;

    public constructor() {
        effect(() => {
            if (!this.products.hasValue()) {
                return;
            }
            const products = this.products.value();
            this.app.productsCount.set(products.length);
            this.app.message.set('Start updating images...');
            void this.update.updateProductImages(products);
        });
    }

    public ngOnInit(): void {
        void this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.storage.create();
        const networkStatus = await Network.getStatus();
        if (networkStatus.connected) {
            try {
                const serverStatus = (await this.api.healthCheck()) as ServerStatus;
                this.app.message.set(`Server status: ${serverStatus}`);
                if (serverStatus === 'Healthy') {
                    await Promise.all([
                        this.update.updateProducts(),
                        this.update.updateCategories(),
                        this.update.updatePrimaryData()
                    ]);
                    this.data.products.reload();
                    this.data.categories.reload();
                    this.data.primaryData.reload();
                }
            } catch {}
        }
    }
}
