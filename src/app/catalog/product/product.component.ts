import { Component, inject, input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import {
    BulkTypeGroup,
    PrimaryData,
    Product,
    ProductType,
    ValueEvent
} from '../../../app/shared/models';
import { DataService } from '../../../app/shared/services/data.service';
import { UpdateService } from '../../shared/services/update.service';
import { MaterialsChartComponent } from '../materials-chart/materials-chart.component';
import { MessageComponent } from '../message/message.component';
import { PaletteComponent } from '../palette/palette.component';

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    standalone: false
})
export class ProductComponent implements OnInit {
    public product = input.required<Product>();
    public p: Product | null = null;
    public primaryData: PrimaryData;
    public rajs: number[] = [];
    public bulkTypeGroups: BulkTypeGroup[] = [];
    public mainImage = '';
    public loading = false;

    private data = inject(DataService);
    private update = inject(UpdateService);
    private modalCtrl = inject(ModalController);
    private toastController = inject(ToastController);

    public constructor() {
        const primaryData = this.data.primaryData;
        this.primaryData = primaryData.value()!;
    }

    public ngOnInit(): void {
        this.p = this.product();
        this.rajs = [...new Set(this.p.BulkTypes?.map(a => a.raj))];
    }

    public async showStockMessage(paletteId?: number, pgId?: number): Promise<void> {
        let message = this.primaryData.settings.ProductionMessage;
        if (paletteId) {
            message = this.primaryData.deliveryMessages[paletteId];
        } else if (pgId) {
            message = this.primaryData.productionGroups[pgId];
        }
        const modal = await this.modalCtrl.create({
            component: MessageComponent,
            componentProps: {
                message
            },
            initialBreakpoint: 1,
            breakpoints: [0, 1],
            cssClass: 'auto-height'
        });
        await modal.present();
    }

    public selectRaj(event: CustomEvent): void {
        this.bulkTypeGroups = [];
        const selectedRaj = (event.detail as ValueEvent).value;
        if (selectedRaj === 0) {
            return;
        }
        const bulkTypes = this.p?.BulkTypes?.filter(a => a.raj === selectedRaj);
        if (!bulkTypes || !bulkTypes.length) {
            return;
        }
        const map = new Map<string, BulkTypeGroup>();
        for (const bt of bulkTypes) {
            const key = `${bt.dimsHeight}-${bt.dimsWidth}-${bt.raj}-${bt.materialId}-${bt.materials}-${bt.tieTypeId}-${bt.mainTieLengthId}`;

            if (!map.has(key)) {
                map.set(key, {
                    dimsHeight: bt.dimsHeight,
                    dimsWidth: bt.dimsWidth,
                    raj: bt.raj,
                    materialId: bt.materialId,
                    materials: bt.materials,
                    tieTypeId: bt.tieTypeId,
                    mainTieLengthId: bt.mainTieLengthId,
                    list: []
                });
            }

            map.get(key)!.list.push({
                price: bt.price,
                count: bt.count
            });
        }
        this.bulkTypeGroups = Array.from(map.values());
    }

    public async showPicture(): Promise<void> {
        const mainImageName = 'main';
        if (this.p?.Images[mainImageName]) {
            this.mainImage = this.p?.Images[mainImageName];
            return;
        }

        this.loading = true;
        const hasMainImage = await this.update.setProductImage(this.p!, 'main');
        this.loading = false;
        if (hasMainImage !== false) {
            await this.showPicture();
            return;
        }

        await this.presentToast(
            'تصویر بزرگ محصول موجود نیست. لطفا اتصال اینترنت خود را بررسی نمایید.'
        );
    }

    public async showColorsPalette(type: ProductType | BulkTypeGroup): Promise<void> {
        if (this.p?.Colors) {
            const modal = await this.modalCtrl.create({
                component: PaletteComponent,
                componentProps: {
                    colors: this.p.Colors,
                    spec: {
                        materialId: type.materialId,
                        raj: type.raj,
                        tieLengthId: type.mainTieLengthId,
                        bulk: !('price' in type)
                    }
                },
                initialBreakpoint: 1,
                breakpoints: [0, 1]
            });
            await modal.present();
            return;
        }
        this.loading = true;
        const hasColors = await this.update.getProductColors(this.p!);
        this.loading = false;
        if (hasColors) {
            await this.showColorsPalette(type);
            return;
        }

        await this.presentToast(
            'پالت رنگ محصول موجود نیست. لطفا اتصال اینترنت خود را بررسی نمایید.'
        );
    }

    public async showMaterialsChart(type: ProductType | BulkTypeGroup): Promise<void> {
        if (this.p?.Colors) {
            const modal = await this.modalCtrl.create({
                component: MaterialsChartComponent,
                componentProps: {
                    colors: this.p.Colors,
                    raj: type.raj
                },
                initialBreakpoint: 1,
                breakpoints: [0, 1]
            });
            await modal.present();
            return;
        }
        this.loading = true;
        const hasColors = await this.update.getProductColors(this.p!);
        this.loading = false;
        if (hasColors) {
            await this.showMaterialsChart(type);
            return;
        }

        await this.presentToast(
            'پالت رنگ محصول موجود نیست. لطفا اتصال اینترنت خود را بررسی نمایید.'
        );
    }

    private async presentToast(message: string): Promise<void> {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            position: 'bottom'
        });
        await toast.present();
    }
}
