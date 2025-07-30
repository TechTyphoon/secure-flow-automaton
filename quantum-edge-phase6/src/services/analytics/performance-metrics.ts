export class PerformanceMetrics {
    private metricsData: Array<{ timestamp: number; metric: string; value: number }> = [];

    constructor() {}

    public collectMetric(metric: string, value: number): void {
        const timestamp = Date.now();
        this.metricsData.push({ timestamp, metric, value });
    }

    public getMetrics(): Array<{ timestamp: number; metric: string; value: number }> {
        return this.metricsData;
    }

    public analyzePerformance(): { [key: string]: number } {
        const analysis: { [key: string]: number } = {};
        
        this.metricsData.forEach(data => {
            if (!analysis[data.metric]) {
                analysis[data.metric] = 0;
            }
            analysis[data.metric] += data.value;
        });

        return analysis;
    }

    public resetMetrics(): void {
        this.metricsData = [];
    }
}