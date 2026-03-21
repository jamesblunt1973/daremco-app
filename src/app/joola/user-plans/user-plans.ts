import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UserPlan } from '../../../app/shared/models';
import { JoolaService } from '../../../app/shared/services/joola.service';

@Component({
    selector: 'app-user-plans',
    templateUrl: 'user-plans.html',
    styleUrl: './user-plans.scss',
    standalone: false
})
export class UserPlansComponent {
    public productsPath = JoolaService.productsPath;
    public isMenuOpen = false;

    public readonly userPlans = signal<UserPlan[]>([]);

    public readonly isLoading = computed<boolean>(
        () => this.joolaService.userPlans.isLoading() || this.imagesHydrating()
    );

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

    private readonly imagesHydrating = signal(false);

    private readonly joolaService = inject(JoolaService);
    private readonly alertController = inject(AlertController);

    public constructor() {
        this.joolaService.loadUserPlans.set(true);
        this.joolaService.userPlans.reload();

        effect(() => {
            const userPlansResource = this.joolaService.userPlans;
            if (userPlansResource.isLoading() || !userPlansResource.hasValue()) {
                return;
            }

            const plans = userPlansResource.value();

            untracked(() => {
                if (!plans.length) {
                    this.userPlans.set([]);
                    return;
                }

                void (async (): Promise<void> => {
                    this.imagesHydrating.set(true);
                    await this.joolaService.updateProductImages(plans);
                    this.imagesHydrating.set(false);

                    this.userPlans.set(plans);
                })();
            });
        });
    }

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
