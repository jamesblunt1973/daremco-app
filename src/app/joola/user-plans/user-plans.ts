import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UserPlan } from '../../../app/shared/models';
import { JoolaService } from '../../../app/shared/services/joola.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-user-plans',
    templateUrl: 'user-plans.html',
    styleUrl: './user-plans.scss',
    standalone: false
})
export class UserPlansComponent {
    public productsPath = `${environment.imageUrl}products/`;
    public Math = Math;
    public isMenuOpen = false;

    public readonly userPlans = computed<UserPlan[]>(() => {
        const userPlansResource = this.joolaService.userPlans;
        return userPlansResource.hasValue() ? userPlansResource.value() : [];
    });

    public readonly isLoading = computed<boolean>(() => this.joolaService.userPlans.isLoading());

    public readonly error = computed<Error | undefined>(() => {
        const userPlansResource = this.joolaService.userPlans;
        if (userPlansResource.status() !== 'error') {
            return undefined;
        }

        const resourceError = userPlansResource.error();
        if (resourceError instanceof HttpErrorResponse) {
            return resourceError;
        }

        return new Error(String(resourceError));
    });

    private readonly joolaService = inject(JoolaService);
    private readonly alertController = inject(AlertController);

    public async removeUserPlan(userPlan: UserPlan): Promise<void> {
        const alert = await this.alertController.create({
            header: '',
            message: 'نقشه مورد نظر حذف شود؟',
            buttons: [
                {
                    text: 'خیر',
                    role: 'cancel'
                },
                {
                    text: 'بله',
                    role: 'confirm'
                }
            ]
        });

        await alert.present();
        const { role } = await alert.onDidDismiss();

        if (role === 'confirm') {
            await this.joolaService.deleteUserPlan(userPlan.id);
        }
    }
}
