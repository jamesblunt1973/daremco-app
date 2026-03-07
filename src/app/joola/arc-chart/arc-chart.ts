import { Component, effect, input } from '@angular/core';
import { ArcRingBase } from '../arc-ring/arc-ring-base';

@Component({
  selector: 'app-arc-chart',
  templateUrl: '../arc-ring/arc-ring.html',
  styleUrls: ['../arc-ring/arc-ring.scss'],
  standalone: false
})
export class ArcChartComponent extends ArcRingBase {
  public diameter = input(50);
  public percent = input(0);

  public constructor() {
    super();

    effect(() => {
      const diameter = this.diameter();
      const percent = this.percent();

      this.updateGeometry(diameter);
      this.arc = this.circumference - percent / 100 * this.circumference;
      this.label = `${percent}%`;
    });
  }

}
