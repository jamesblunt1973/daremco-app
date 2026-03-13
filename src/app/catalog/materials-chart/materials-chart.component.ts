import { Component, effect, inject, input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProductColor } from '../../shared/models';
import { DataService } from '../../shared/services/data.service';

type MaterialUsage = {
    MaterialGroupId: number;
    ColorsCount: number;
    TiesCount: number;
    Material: string;
    Percent: number;
};

type ChartData = {
    label: string;
    value: number;
    color: string;
};

@Component({
    selector: 'app-materials-chart',
    templateUrl: './materials-chart.component.html',
    styleUrls: ['./materials-chart.component.scss'],
    standalone: false
})
export class MaterialsChartComponent {
    public colors = input.required<ProductColor[]>();
    public raj = input.required<number>();
    public materials: MaterialUsage[] = [];
    public chartData: ChartData[] = [];
    public chartColors = ['#468dbf', '#fdb45c', '#f7464a', '#49c66f'];

    private data = inject(DataService);
    private modalCtrl = inject(ModalController);
    private total = 0;

    public constructor() {
        const primaryData = this.data.primaryData.value()!;

        effect(() => {
            const dkbRaj = primaryData.rajs[this.raj()];
            const colors = this.colors();
            if (!colors.length) {
                return;
            }
            const filtered = colors.filter(a => a.materialGroupId != null);
            const grouped = new Map<number, ProductColor[]>();
            for (const color of filtered) {
                const key = color.materialGroupId!;
                if (!grouped.has(key)) {
                    grouped.set(key, []);
                }
                grouped.get(key)!.push(color);
                this.total += color.count;
            }

            this.materials = Array.from(grouped.entries())
                .map(([materialGroupId, items]) => {
                    const materialRaj = dkbRaj.materialRajs[materialGroupId - 1];
                    const material = primaryData.materials[materialRaj.materialId];
                    const tiesCount = items.reduce((sum, b) => sum + b.count, 0);

                    return {
                        MaterialGroupId: materialGroupId,
                        ColorsCount: items.length,
                        TiesCount: tiesCount,
                        Material: material.name,
                        Percent: Math.round((tiesCount / this.total) * 1000) / 10
                    };
                })
                .sort((a, b) => a.MaterialGroupId - b.MaterialGroupId);

            this.chartData = this.materials.map((a, index) => ({
                label: a.Material,
                value: a.TiesCount,
                color: this.chartColors[index]
            }));
        });
    }

    public async close(): Promise<void> {
        await this.modalCtrl.dismiss();
    }
}
