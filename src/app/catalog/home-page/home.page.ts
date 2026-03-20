import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { AppService } from '../../shared/services/app.service';
import { DataService } from '../../shared/services/data.service';
import { UpdateService } from '../../shared/services/update.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrl: 'home.page.scss',
    standalone: false
})
export class HomePage implements OnInit {
    public data = inject(DataService);
    public update = inject(UpdateService);
    public app = inject(AppService);
    public api = inject(ApiService);

    public ngOnInit(): void {
        void this.initialize();
    }

    public canDismiss(data?: undefined, role?: string): boolean {
        return role !== 'gesture';
    }

    private async initialize(): Promise<void> {
        if (this.app.serverAvailable()) {
            try {
                await Promise.all([
                    this.update.updateProducts(),
                    this.update.updateCategories(),
                    this.update.updatePrimaryData(),
                    this.update.updateMostUsedLinks()
                ]);
                this.data.reload();
                this.app.isInitializing.set(false);
            } catch (error: unknown) {
                this.setUpdatingStatus((error as Error).message);
            }
        } else {
            this.setUpdatingStatus('Server is not available.');
        }
    }

    private setUpdatingStatus(message: string): void {
        const hasCoreData = this.data.hasCoreData();
        if (!hasCoreData) {
            this.app.updatingError.set(`${message} Offline data is not available.`);
            return;
        }

        this.app.isInitializing.set(false);
    }
}
