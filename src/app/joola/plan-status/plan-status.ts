import { Component, input } from '@angular/core';
import { UserPlan } from '../../shared/models';

@Component({
    selector: 'app-plan-status',
    templateUrl: './plan-status.html',
    styleUrl: './plan-status.scss',
    standalone: false
})
export class PlanStatusComponent {
    public userPlan = input<UserPlan>();
    public Math = Math;
}
