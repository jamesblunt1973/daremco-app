export abstract class ArcRingBase {
    public circumference = 0;
    public arc = 0;
    public strokeWidth = 0;
    public fontSize = 0;
    public label = '';

    protected updateGeometry(diameter: number): void {
        this.circumference = (diameter - 8) * Math.PI;
        this.strokeWidth = Math.round(diameter / 8);
        this.fontSize = Math.round(diameter / 4);
    }
}
