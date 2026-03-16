import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-select-product-options',
    templateUrl: './select-product-options.html',
    styleUrl: './select-product-options.scss',
    standalone: false
})
export class SelectProductOptionsComponent {
    public rajs = [20, 30, 35, 40, 46, 50, 55, 60, 70];
    public result = {
        raj: 46,
        turned: false
    };

    private readonly modalCtrl = inject(ModalController);

    public async dismiss(sendRes: boolean): Promise<void> {
        const data = sendRes ? this.result : null;
        await this.modalCtrl.dismiss(data);
    }
}
