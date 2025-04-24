import { Component, inject, input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BulkTypeGroup, PrimaryData, Product, ValueEvent } from '../../../app/shared/models';
import { DataService } from '../../../app/shared/services/data.service';
import { MessageComponent } from '../message/message.component';

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

    private data = inject(DataService);
    private modalCtrl = inject(ModalController);

    public constructor() {
        const primaryData = this.data.primaryData;
        this.primaryData = primaryData.value()!;
    }

    public ngOnInit(): void {
        this.p = this.product();
        this.rajs = [...new Set(this.p.BulkTypes?.map(a => a.Raj))];
    }

    public async showMessage(paletteId: number): Promise<void> {
        const modal = await this.modalCtrl.create({
            component: MessageComponent,
            componentProps: {
                message: this.primaryData.deliveryMessages[paletteId]
            },
            initialBreakpoint: 1,
            breakpoints: [0, 1]
        });
        await modal.present();
    }

    public selectRaj(event: CustomEvent): void {
        this.bulkTypeGroups = [];
        const selectedRaj = (event.detail as ValueEvent).value;
        if (selectedRaj === 0) {
            return;
        }
        const bulkTypes = this.p?.BulkTypes?.filter(a => a.Raj === selectedRaj);
        if (!bulkTypes || !bulkTypes.length) {
            return;
        }
        const map = new Map<string, BulkTypeGroup>();
        for (const bt of bulkTypes) {
            const key = `${bt.DimsHeight}-${bt.DimsWidth}-${bt.Raj}-${bt.MaterialId}-${bt.Materials}-${bt.TieTypeId}-${bt.MainTieLengthId}`;

            if (!map.has(key)) {
                map.set(key, {
                    DimsHeight: bt.DimsHeight,
                    DimsWidth: bt.DimsWidth,
                    Raj: bt.Raj,
                    MaterialId: bt.MaterialId,
                    Materials: bt.Materials,
                    TieTypeId: bt.TieTypeId,
                    MainTieLengthId: bt.MainTieLengthId,
                    List: []
                });
            }

            map.get(key)!.List.push({
                Price: bt.Price,
                Count: bt.Count
            });
        }
        this.bulkTypeGroups = Array.from(map.values());
    }
}
