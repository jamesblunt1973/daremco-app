import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ProductOptionResult, UserPurchase } from '../../shared/models';
import { JoolaService } from '../../shared/services/joola.service';
import { SelectProductOptionsComponent } from '../select-product-options/select-product-options';

@Component({
    selector: 'app-add-basket',
    templateUrl: './add-basket.html',
    styleUrl: './add-basket.scss',
    standalone: false
})
export class AddBasketComponent {
    public productsPath = JoolaService.productsPath;

    public readonly userPurchases = computed<UserPurchase[]>(() => {
        const userPurchasesResource = this.joolaService.userPurchases;
        return userPurchasesResource.hasValue() ? userPurchasesResource.value() : [];
    });

    public readonly isLoading = computed<boolean>(() =>
        this.joolaService.userPurchases.isLoading()
    );

    public readonly error = computed<Error | undefined>(() => {
        const userPurchasesResource = this.joolaService.userPurchases;
        if (userPurchasesResource.status() !== 'error') {
            return undefined;
        }

        const resourceError = userPurchasesResource.error();
        if (resourceError instanceof HttpErrorResponse) {
            return resourceError;
        }

        return new Error(String(resourceError));
    });

    private readonly joolaService = inject(JoolaService);
    private readonly toastCtrl = inject(ToastController);
    private readonly modalCtrl = inject(ModalController);

    public async addProduct(productId: number): Promise<void> {
        const modal = await this.modalCtrl.create({
            component: SelectProductOptionsComponent,
            initialBreakpoint: 1,
            breakpoints: [0, 1],
            cssClass: 'auto-height'
        });
        await modal.present();

        const { data } = await modal.onWillDismiss<ProductOptionResult>();

        if (data) {
            await this.joolaService.addUserPlan(productId, data.raj, data.turned);
            this.joolaService.userPurchases.update(purchases =>
                purchases.filter(p => p.productId !== productId)
            );
            const toast = await this.toastCtrl.create({
                color: 'success',
                message: 'نقشه مورد نظر به لیست در حال بافت اضافه شد.',
                duration: 1500,
                position: 'bottom'
            });
            await toast.present();
        }
    }
}
