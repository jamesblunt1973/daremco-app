import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IUserPucrhcase } from '../../models/user-purchases.model';
import { JoolaService } from '../../services/joola.service';
import { SelectProductOptionsComponent } from '../select-product-options/select-product-options.component';

@Component({
  selector: 'app-add-basket',
  templateUrl: './add-basket.component.html',
  styleUrls: ['./add-basket.component.scss']
})
export class AddBasketComponent implements OnInit {

  userPurchases: IUserPucrhcase[] = [];
  productsPath = this.joolaService.productsPath;

  constructor(private joolaService: JoolaService, private dialog: MatDialog) { }

  ngOnInit() {
    this.joolaService.getUserPurchases().subscribe(res => {
      this.userPurchases = res;
    });
  }

  addProduct(productId: number) {
    const dialogRef = this.dialog.open(SelectProductOptionsComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.joolaService.addUserPlan(productId, result.raj, result.turned).subscribe(() => {
          const index = this.userPurchases.findIndex(a => {
            return a.productId == productId;
          });
          this.userPurchases.splice(index, 1);
        });
      }
    });
  }
}
