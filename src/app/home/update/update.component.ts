import { Component, computed, inject } from '@angular/core';
import { AppService } from '../../shared/services/app.service';

@Component({
    selector: 'app-update',
    templateUrl: './update.component.html',
    styleUrls: ['./update.component.scss'],
    standalone: false
})
export class UpdateComponent {
    public app = inject(AppService);
    public progress = computed(() => ({
        percent: this.app.processedImages() / this.app.productsCount()
    }));
}
