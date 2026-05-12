import { signal } from '@angular/core';

export abstract class ArcRingBase {
    public readonly circumference = signal(0);
    public readonly arc = signal(0);
    public readonly strokeWidth = signal(0);
    public readonly fontSize = signal(0);
    public readonly label = signal('');

    protected updateGeometry(diameter: number): void {
        this.circumference.set((diameter - 8) * Math.PI);
        this.strokeWidth.set(Math.round(diameter / 8));
        this.fontSize.set(Math.round(diameter / 4));
    }
}
