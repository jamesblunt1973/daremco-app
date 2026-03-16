import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { JoolaProduct, ProductOptionResult } from '../../shared/models';
import { JoolaService } from '../../shared/services/joola.service';
import { SelectProductOptionsComponent } from '../select-product-options/select-product-options';

@Component({
    selector: 'app-add-product',
    templateUrl: './add-product.html',
    styleUrl: './add-product.scss',
    standalone: false
})
export class AddProductComponent {
    public productsPath = JoolaService.productsPath;
    public searchTerm = '';

    private readonly joolaService = inject(JoolaService);
    private readonly modalCtrl = inject(ModalController);
    private readonly toastCtrl = inject(ToastController);
    private readonly destroyRef = inject(DestroyRef);
    private readonly searchInput$ = new Subject<string>();

    public constructor() {
        this.searchInput$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                tap(term => {
                    this.searchTerm = term.trim();
                    this.joolaService.setProductSearchTerm(this.searchTerm);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    public get products(): JoolaProduct[] {
        const searchResource = this.joolaService.searchedProducts;
        return searchResource.hasValue() ? searchResource.value() : [];
    }

    public get searching(): boolean {
        return this.joolaService.searchedProducts.isLoading();
    }

    public get searchFailed(): boolean {
        return this.joolaService.searchedProducts.status() === 'error';
    }

    public onSearchInput(value: string | null | undefined): void {
        this.searchInput$.next(String(value ?? ''));
    }

    public async addProduct(productId: number): Promise<void> {
        const modal = await this.modalCtrl.create({
            component: SelectProductOptionsComponent,
            initialBreakpoint: 1,
            breakpoints: [0, 1],
            cssClass: 'auto-height'
        });
        await modal.present();

        const { data } = await modal.onWillDismiss<ProductOptionResult>();

        if (!data) {
            return;
        }

        await this.joolaService.addUserPlan(productId, data.raj, data.turned);
        this.searchTerm = '';
        this.joolaService.setProductSearchTerm('');

        const toast = await this.toastCtrl.create({
            color: 'success',
            message: 'محصول مورد نظر به لیست در حال بافت اضافه شد.',
            duration: 1500,
            position: 'bottom'
        });
        await toast.present();
    }
}
