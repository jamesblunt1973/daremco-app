import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { UserPlan } from '../../shared/models';
import { JoolaService } from '../../shared/services/joola.service';

@Component({
    selector: 'app-add-archive',
    templateUrl: './add-archive.html',
    styleUrl: './add-archive.scss',
    standalone: false
})
export class AddArchiveComponent {
    public productsPath = JoolaService.productsPath;

    public readonly archivedPlans = computed<UserPlan[]>(() => {
        const archivedPlansResource = this.joolaService.archivedPlans;
        return archivedPlansResource.hasValue() ? archivedPlansResource.value() : [];
    });

    public readonly isLoading = computed<boolean>(() =>
        this.joolaService.archivedPlans.isLoading()
    );

    public readonly error = computed<Error | undefined>(() => {
        const archivedPlansResource = this.joolaService.archivedPlans;
        if (archivedPlansResource.status() !== 'error') {
            return undefined;
        }

        const resourceError = archivedPlansResource.error();
        if (resourceError instanceof HttpErrorResponse) {
            return resourceError;
        }

        return new Error(String(resourceError));
    });

    private readonly joolaService = inject(JoolaService);
    private readonly toastCtrl = inject(ToastController);

    public async addPlan(id: number): Promise<void> {
        await this.joolaService.addFromArchive(id);
        this.joolaService.archivedPlans.update(plans => plans.filter(p => p.id !== id));
        const toast = await this.toastCtrl.create({
            color: 'success',
            message: 'نقشه مورد نظر به لیست در حال بافت اضافه شد.',
            duration: 1500,
            position: 'bottom'
        });
        await toast.present();
    }
}
