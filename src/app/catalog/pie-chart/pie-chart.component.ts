import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

type PieSlice = {
    label: string;
    value: number;
    color: string;
};

@Component({
    selector: 'app-pie-chart',
    templateUrl: './pie-chart.component.html',
    styleUrls: ['./pie-chart.component.scss'],
    standalone: false
})
export class PieChartComponent implements OnInit, AfterViewInit {
    @ViewChild('canvas', { static: true }) public canvasRef!: ElementRef<HTMLCanvasElement>;

    @Input() public data: PieSlice[] = [];

    private ctx!: CanvasRenderingContext2D;
    private total = 0;
    private animationProgress = 0;
    private size = 360;
    private halfSize = this.size / 2;
    private startTime = 0;
    private duration = 1500;

    public ngOnInit(): void {
        this.total = this.data.reduce((sum, slice) => sum + slice.value, 0);
    }

    public ngAfterViewInit(): void {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;
        canvas.width = this.size;
        canvas.height = this.size;
        requestAnimationFrame(this.animate);
    }

    private animate = (timestamp: number): void => {
        if (!this.startTime) {
            this.startTime = timestamp;
        }
        const elapsed = timestamp - this.startTime;
        const t = Math.min(elapsed / this.duration, 1);
        this.animationProgress = this.easeOutBounce(t);
        this.drawChart();

        if (t < 1) {
            requestAnimationFrame(this.animate);
        }
    };

    private drawChart(): void {
        const ctx = this.ctx;
        const radius = this.halfSize;
        const centerX = this.halfSize;
        const centerY = this.halfSize;

        ctx.clearRect(0, 0, this.size, this.size);

        let startAngle = -Math.PI / 2;

        for (const slice of this.data) {
            const sliceAngle = (slice.value / this.total) * 2 * Math.PI * this.animationProgress;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = slice.color;
            ctx.fill();

            // Draw label
            const midAngle = startAngle + (endAngle - startAngle) / 2;
            const labelX = centerX + Math.cos(midAngle) * radius * 0.7;
            const labelY = centerY + Math.sin(midAngle) * radius * 0.7;
            ctx.fillStyle = '#000';
            ctx.font = '10px IRANSans';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(slice.label, labelX, labelY);

            startAngle = endAngle;
        }
    }

    private easeOutBounce(t: number): number {
        return (t /= 1) < 1 / 2.75
            ? 7.5625 * t * t
            : 2 / 2.75 > t
            ? 1 * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75)
            : 2.5 / 2.75 > t
            ? 1 * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375)
            : 1 * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
    }
}
