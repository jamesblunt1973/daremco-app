import { Component, inject, OnInit } from '@angular/core';
import { Network } from '@capacitor/network';
import { Storage } from '@ionic/storage-angular';
import { ServerStatus } from '../../shared/models/types/server-status';
import { ApiService } from '../../shared/services/api.service';
import { AppService } from '../../shared/services/app.service';
import { DataService } from '../../shared/services/data.service';
import { UpdateService } from '../../shared/services/update.service';

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
        try {
            await this.storage.create();
            const isConnected = await this.isNetworkConnected();

            if (!isConnected) {
                this.setUpdatingStatus('Network status: Not connected');
                return;
            }

            await this.handleOnlineInitialization();
        } catch (error: unknown) {
            this.setUpdatingStatus((error as Error).message);
        }
    }

    private async isNetworkConnected(): Promise<boolean> {
        const networkStatus = await Network.getStatus();
        return networkStatus.connected;
    }

    private async handleOnlineInitialization(): Promise<void> {
        const serverStatus = (await this.api.healthCheck()) as ServerStatus;
        this.app.serverStatus.set(serverStatus);

        if (serverStatus !== 'Healthy') {
            this.setUpdatingStatus(`Server status: ${serverStatus}`);
            return;
        }

        await this.synchronizeData();
        this.data.reload();
        this.app.isInitializing.set(false);
    }

    private async synchronizeData(): Promise<void> {
        await Promise.all([
            this.update.updateProducts(),
            this.update.updateCategories(),
            this.update.updatePrimaryData(),
            this.update.updateMostUsedLinks()
        ]);
    }

    private setUpdatingStatus(message: string): void {
        const hasCoreData = this.data.hasCoreData();
        if (!hasCoreData) {
            this.app.isUpdating.set(message);
            return;
        }

        this.app.isUpdating.set('');
    }
}
