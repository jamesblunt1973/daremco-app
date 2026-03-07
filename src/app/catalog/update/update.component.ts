import { Component, effect, inject } from '@angular/core';
import { AppService } from '../../shared/services/app.service';

@Component({
    selector: 'app-update',
    templateUrl: './update.component.html',
    styleUrls: ['./update.component.scss'],
    standalone: false
})
export class UpdateComponent {
    public messages: string[] = [];
    public app = inject(AppService);

    public constructor() {
        effect(() => {
            if (this.app.message() !== '') {
                this.messages = [...this.messages, this.app.message()];
            }
        });
    }
}
