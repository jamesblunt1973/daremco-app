import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    finalize,
    map,
    switchMap,
    tap
} from 'rxjs/operators';

@Component({
    selector: 'app-add-product',
    templateUrl: './add-product.component.html',
    styleUrl: './add-product.component.scss'
})
export class AddProductComponent implements OnInit, AfterViewInit {
    @ViewChild('searchInput') input: ElementRef;

    products: IProduct[] = [];
    searching = false;
    searchFailed = false;
    productsPath = this.joolaService.productsPath;

    constructor(private joolaService: JoolaService, private dialog: MatDialog) {}

    ngOnInit() {}

    ngAfterViewInit(): void {
        fromEvent<any>(this.input.nativeElement, 'keyup')
            .pipe(
                map(event => event.target.value),
                filter(text => text.length > 2),
                debounceTime(300),
                distinctUntilChanged(),
                tap(() => (this.searching = true)),
                switchMap(term =>
                    this.joolaService.searchProducts(term).pipe(
                        tap(() => (this.searchFailed = false)),
                        finalize(() => (this.searching = false)),
                        catchError(() => {
                            this.searchFailed = true;
                            return of([]);
                        })
                    )
                )
            )
            .subscribe(res => (this.products = res));
    }

    addProduct(productId: number) {
        const dialogRef = this.dialog.open(SelectProductOptionsComponent);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.joolaService
                    .addUserPlan(productId, result.raj, result.turned)
                    .subscribe(() => {
                        this.products = [];
                        this.input.nativeElement.value = '';
                    });
            }
        });
    }
}
