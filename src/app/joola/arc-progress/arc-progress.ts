import { Component, effect, input } from '@angular/core';

@Component({
  selector: 'app-arc-progress',
  templateUrl: './arc-progress.html',
  styleUrls: ['./arc-progress.scss'],
  standalone: false
})
export class ArcProgressComponent {
  public diameter = input(50);
  public time = input(0);
  public circumference = 0;
  public arc = 0;
  public strokeWidth = 0;
  public fontSize = 0;
  public seconds = 0;
  public intervalId = 0;

  public constructor() {
    effect((onCleanup) => {
      const diameter = this.diameter();
      const time = this.time();

      this.circumference = (diameter - 8) * Math.PI;
      this.strokeWidth = Math.round(diameter / 8);
      this.fontSize = Math.round(diameter / 4);
      this.seconds = Math.round(time / 100) / 10;
      this.arc = 0;

      if (time <= 0) {
        this.intervalId = 0;
        return;
      }

      let step = this.seconds >= 1 ? 1 : 0.1;
      let boundry = step * 100;
      let tick = time;
      let counter = 0;

      this.intervalId = window.setInterval(() => {
        this.arc = this.circumference - tick / time * this.circumference;
        tick -= 10;
        counter++;
        if (counter >= boundry) {
          this.seconds = Math.round((this.seconds - step) * 10) / 10;
          step = this.seconds >= 1 ? 1 : 0.1;
          boundry = step * 100;
          counter = 0;
        }
      }, 10);

      onCleanup(() => {
        window.clearInterval(this.intervalId);
      });
    });
  }
}
