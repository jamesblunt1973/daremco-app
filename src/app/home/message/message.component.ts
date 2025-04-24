import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-message',
    template: '<p class="ion-padding ion-margin-bottom" [innerHTML]="message"></p>',
    standalone: false
})
export class MessageComponent {
    @Input() public message?: string;
}
