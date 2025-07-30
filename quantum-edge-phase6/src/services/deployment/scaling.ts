export class Scaling {
    private minInstances: number;
    private maxInstances: number;
    private currentInstances: number;
    private scalingThreshold: number;

    constructor(minInstances: number, maxInstances: number, scalingThreshold: number) {
        this.minInstances = minInstances;
        this.maxInstances = maxInstances;
        this.currentInstances = minInstances;
        this.scalingThreshold = scalingThreshold;
    }

    public scaleUp(): void {
        if (this.currentInstances < this.maxInstances) {
            this.currentInstances++;
            console.log(`Scaled up to ${this.currentInstances} instances.`);
        } else {
            console.log('Maximum instance limit reached. Cannot scale up.');
        }
    }

    public scaleDown(): void {
        if (this.currentInstances > this.minInstances) {
            this.currentInstances--;
            console.log(`Scaled down to ${this.currentInstances} instances.`);
        } else {
            console.log('Minimum instance limit reached. Cannot scale down.');
        }
    }

    public checkScalingConditions(currentLoad: number): void {
        if (currentLoad > this.scalingThreshold) {
            this.scaleUp();
        } else if (currentLoad < this.scalingThreshold / 2) {
            this.scaleDown();
        }
    }

    public getCurrentInstances(): number {
        return this.currentInstances;
    }
}