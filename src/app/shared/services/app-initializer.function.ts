import { inject } from '@angular/core';
import { Network } from '@capacitor/network';
import { Storage } from '@ionic/storage-angular';
import { ServerStatus } from '../models/types/server-status.type';
import { ApiService } from './api.service';
import { UpdateService } from './update.service';

export const AppInitializer = async (): Promise<void> => {
    const storage = inject(Storage);
    const api = inject(ApiService);
    const update = inject(UpdateService);

    await storage.create();
    const networkStatus = await Network.getStatus();
    if (networkStatus.connected) {
        try {
            const serverStatus = (await api.healthCheck()) as ServerStatus;
            if (serverStatus === 'Healthy') {
                await Promise.all([
                    update.updateProducts(),
                    update.updateCategories(),
                    update.updatePrimaryData()
                ]);
            }
        } catch {}
    }
};
