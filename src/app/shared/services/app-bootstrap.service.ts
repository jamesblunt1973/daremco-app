import { inject, Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { ServerStatus } from '../models';
import { ApiService } from './api.service';
import { AppService } from './app.service';

@Injectable({
    providedIn: 'root'
})
export class AppBootstrapService {
    private app = inject(AppService);
    private api = inject(ApiService);

    public async bootstrap(): Promise<void> {
        await this.setServerStatus();
        this.removeLoading();
    }

    private async setServerStatus(): Promise<void> {
        try {
            const networkStatus = await Network.getStatus();
            if (networkStatus.connected) {
                const serverStatus = (await this.api.healthCheck()) as ServerStatus;
                this.app.serverStatus.set(serverStatus);
            }
        } catch {}
    }

    private removeLoading(): void {
        const el = document.getElementById('app-loading');
        if (el) {
            el.remove();
        }
    }
}
