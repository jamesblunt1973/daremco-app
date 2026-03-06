import { Component } from "@angular/core";
import { UserPlan } from "../../shared/models/entities/user-plan";

@Component({
    selector: 'app-user-plans',
    templateUrl: 'user-plans.html',
    styleUrl: './user-plans.scss',
    standalone: false
})
export class UserPlansComponent {
  public userPlans: UserPlan[] = [];
  productsPath = this.joolaService.productsPath;
  Math = Math;
  isMenuOpen = false;

  constructor(private joolaService: JoolaService, private dialog: MatDialog) { }

  ngOnInit() {
    this.joolaService.getUserPlans().subscribe(res => {
      this.userPlans = res;
    });
  }

  removeUserPlan(userPlan: IUserPlan) {
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