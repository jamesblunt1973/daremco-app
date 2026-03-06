import { Component, inject, OnInit } from '@angular/core';
import { UserPlan } from 'src/app/shared/models';
import { JoolaService } from 'src/app/shared/services/joola.service';
import { environment } from 'src/environments/environment';

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
    private dialog = inject(MatDialog);

    public ngOnInit(): void {
        this.joolaService.getUserPlans().subscribe(res => {
            this.userPlans = res;
        });
    }

    public removeUserPlan(userPlan: UserPlan): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '250px',
            data: {
                title: '',
                message: 'نقشه‌ی مورد نظر حذف شود؟',
                okText: 'بله',
                cancelText: 'خیر'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.joolaService.deleteUserPlan(userPlan.id);
            }
        });
    }
}
