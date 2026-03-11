import { Component, OnInit, OnDestroy } from '@ang

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    standalone: false
})
export class LayoutComponent implements OnInit {
    constructor() {}

    ngOnInit() {}

    ngOnDestroy() {
        // unsubscribe
    }
}
