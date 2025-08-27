import winston from 'winston';
/**
 * Configuração de logging para observabilidade
 * Logs estruturados para facilitar monitoramento
 */
export declare const logger: winston.Logger;
export declare const requestLogger: (req: any, res: any, next: any) => void;
export declare const logPerformance: (operation: string, startTime: number, metadata?: any) => void;
export declare const logError: (error: Error, context?: any) => void;
export declare class MetricsCollector {
    private static counters;
    private static gauges;
    static incrementCounter(name: string, value?: number): void;
    static setGauge(name: string, value: number): void;
    static getMetrics(): object;
    static reset(): void;
}
//# sourceMappingURL=logger.d.ts.map