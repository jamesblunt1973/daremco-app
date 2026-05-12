import { Component, effect, input } from '@angular/core';
import { ArcRingBase } from '../arc-ring/arc-ring-base';

const TICK_MS = 100;

@Component({
    selector: 'app-arc-progress',
    templateUrl: '../arc-ring/arc-ring.html',
    styleUrl: '../arc-ring/arc-ring.scss',
    standalone: false
})
export class ArcProgressComponent extends ArcRingBase {
    public diameter = input(50);
    public time = input(0);

    private intervalId: number | null = null;

    public constructor() {
        super();

        effect(onCleanup => {
            const diameter = this.diameter();
            const time = this.time();

            this.updateGeometry(diameter);
            this.clearTick();

            if (time <= 0) {
                this.arc.set(0);
                this.label.set('');
                return;
            }

            this.render(time, time);

            let remaining = time;
            this.intervalId = window.setInterval(() => {
                remaining = Math.max(remaining - TICK_MS, 0);
                this.render(remaining, time);
                if (remaining <= 0) {
                    this.clearTick();
                }
            }, TICK_MS);

            onCleanup(() => this.clearTick());
        });
    }

    private render(remaining: number, total: number): void {
        const circ = this.circumference();
        this.arc.set(circ - (remaining / total) * circ);
        this.label.set(`${Math.ceil(remaining / 1000)}`);
    }

    private clearTick(): void {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
