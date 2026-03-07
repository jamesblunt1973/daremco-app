import { Component, inject, OnInit } from '@angular/core';
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

    public ngOnInit(): void {
        void this.initialize();
    }

    public canDismiss(data?: undefined, role?: string): boolean {
        return role !== 'gesture';
    }

    private async initialize(): Promise<void> {
        await this.storage.create();
        const networkStatus = await Network.getStatus();
        if (networkStatus.connected) {
            try {
                const serverStatus = (await this.api.healthCheck()) as ServerStatus;
                this.app.serverStatus.set(serverStatus);
                if (serverStatus === 'Healthy') {
                    await Promise.all([
                        this.update.updateProducts(),
                        this.update.updateCategories(),
                        this.update.updatePrimaryData(),
                        this.update.updateMostUsedLinks()
                    ]);
                    this.data.reload();
                }
            } finally {
                this.app.isUpdating.set(false);
            }
        } else {
            this.app.isUpdating.set(false);
        }
    }
}
