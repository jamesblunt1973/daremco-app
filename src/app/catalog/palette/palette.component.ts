import { Component, effect, inject, input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Material, ProductColor } from '../../shared/models';
import { DataService } from '../../shared/services/data.service';

type ProductSpec = {
    materialId: number;
    raj: number;
    tieLengthId: number;
    bulk: boolean;
};

@Component({
    selector: 'app-palette',
    templateUrl: './palette.component.html',
    styleUrl: './palette.component.scss',
    standalone: false
})
export class PaletteComponent {
    public colors = input.required<ProductColor[]>();
    public spec = input.required<ProductSpec>();
    public bulk = true;

    private data = inject(DataService);
    private modalCtrl = inject(ModalController);

    public constructor() {
        const primaryData = this.data.primaryData.value()!;

        effect(() => {
            const spec = this.spec();
            const dkbRaj = primaryData.rajs[spec.raj];
            const colors = this.colors();
            if (!colors.length) {
                return;
            }
            this.bulk = spec.bulk;
            colors.forEach(color => {
                let material: Material;

                if (color.materialGroupId) {
                    if (spec.materialId) {
                        material = primaryData.materials[spec.materialId];
                    } else {
                        const materialRaj = dkbRaj.materialRajs[color.materialGroupId - 1];
                        material = primaryData.materials[materialRaj.materialId];
                    }
                } else {
                    material = {
                        name: 'نبافت',
                        weight: 0,
                        showWeightCoef: 0
                    } as Material;
                }

                const mainTieLen = primaryData.tieLengths[spec.tieLengthId];
                let weight =
                    color.count *
                    mainTieLen.length *
                    material.weight *
                    (1 + material.showWeightCoef);
                if (weight < 10) {
                    weight = Math.round(weight * 10) / 10;
                } else {
                    weight = Math.round(weight);
                }

                color.weight = weight;
                color.material = material.name;
            });
        });
    }

    public async close(): Promise<void> {
        await this.modalCtrl.dismiss();
    }
}
