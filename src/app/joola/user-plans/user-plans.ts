import { Component, inject, OnInit } from '@angular/core';
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
export class UserPlansComponent implements OnInit {
    public userPlans: UserPlan[] = [];
    public productsPath = `${environment.imageUrl}products/`;
    public Math = Math;
    public isMenuOpen = false;

    private joolaService = inject(JoolaService);
    private alertController = inject(AlertController);

    public ngOnInit(): void {
        this.userPlans = this.joolaService.userPlans.value();
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
