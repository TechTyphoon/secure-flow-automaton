export class UsageAnalytics {
    private usageData: Map<string, number>;

    constructor() {
        this.usageData = new Map();
    }

    public trackServiceUsage(serviceName: string): void {
        const currentCount = this.usageData.get(serviceName) || 0;
        this.usageData.set(serviceName, currentCount + 1);
    }

    public getUsageReport(): Record<string, number> {
        const report: Record<string, number> = {};
        this.usageData.forEach((count, service) => {
            report[service] = count;
        });
        return report;
    }

    public resetUsageData(): void {
        this.usageData.clear();
    }
}