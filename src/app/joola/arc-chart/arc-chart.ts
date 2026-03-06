import { Component, effect, input } from '@angular/core';

@Component({
  selector: 'app-arc-chart',
  templateUrl: './arc-chart.html',
  styleUrls: ['./arc-chart.scss'],
  standalone: false
})
export class ArcChartComponent {
  public diameter = input(50);
  public percent = input(0);
  public circumference = 0;
  public arc = 0;
  public strokeWidth = 0;
  public fontSize = 0;

  public constructor() {
    effect(() => {
      const diameter = this.diameter();
      const percent = this.percent();

      this.circumference = (diameter - 8) * Math.PI;
      this.arc = this.circumference - percent / 100 * this.circumference;
      this.strokeWidth = Math.round(diameter / 8);
      this.fontSize = Math.round(diameter / 4);
    });
  }

}
