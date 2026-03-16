import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService } from '../../shared/services/data.service';
import { UpdateService } from '../../shared/services/update.service';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrl: './help.component.scss',
    standalone: false
})
export class HelpComponent {
    public isUpdating = false;

    private data = inject(DataService);
    private update = inject(UpdateService);
    private modalCtrl = inject(ModalController);

    public async downloadMain(): Promise<void> {
        const products = this.data.products.value();
        if (!products.length) {
            // show message
            return;
        }
        this.isUpdating = true;
        await this.update.updateProductImages(products, '300');
        this.isUpdating = false;
    }

    public async downloadLarge(): Promise<void> {
        const products = this.data.products.value();
        if (!products.length) {
            // show message
            return;
        }
        this.isUpdating = true;
        await this.update.updateProductImages(products, 'main');
        this.isUpdating = false;
    }

    public async downloadPalette(): Promise<void> {
        this.isUpdating = true;
        await this.update.updateProductColors();
        this.isUpdating = false;
    }

    public async closeHelp(): Promise<void> {
        await this.modalCtrl.dismiss();
    }
}
