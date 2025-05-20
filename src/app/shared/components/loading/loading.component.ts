import { Component, input } from '@angular/core';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
    standalone: false
})
export class LoadingComponent {
    public loading = input.required<boolean>();
}
