import { Component, effect, input } from '@angular/core';
import { ArcRingBase } from '../arc-ring/arc-ring-base';

@Component({
    selector: 'app-arc-progress',
    templateUrl: '../arc-ring/arc-ring.html',
    styleUrls: ['../arc-ring/arc-ring.scss'],
    standalone: false
})
export class ArcProgressComponent extends ArcRingBase {
    public diameter = input(50);
    public time = input(0);
    public seconds = 0;
    public intervalId = 0;

    public constructor() {
        super();

        effect(onCleanup => {
            const diameter = this.diameter();
            const time = this.time();

            this.updateGeometry(diameter);
            this.arc = 0;
            this.seconds = Math.round(Math.max(time, 0) / 100) / 10;
            this.label = `${this.seconds}`;

            if (time <= 0) {
                this.intervalId = 0;
                return;
            }

            let tick = time;

            this.intervalId = window.setInterval(() => {
                tick -= 10;
                if (tick <= 0) {
                    tick = 0;
                    window.clearInterval(this.intervalId);
                    this.intervalId = 0;
                }

                this.arc = this.circumference - (tick / time) * this.circumference;
                this.seconds = Math.round(tick / 100) / 10;
                this.label = `${this.seconds}`;
            }, 10);

            onCleanup(() => {
                window.clearInterval(this.intervalId);
            });
        });
    }
}
