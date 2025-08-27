import winston from 'winston';
/**
 * Configuração de logging para observabilidade
 * Logs estruturados para facilitar monitoramento
 */
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
    defaultMeta: {
        service: 'personfinder-backend',
        version: '1.0.0'
    },
    transports: [
        // Console output para desenvolvimento
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple())
        }),
        // Arquivo para logs de erro
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Arquivo para todos os logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});
// Middleware para Express logging
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
    });
    next();
};
// Helper para logs de performance
export const logPerformance = (operation, startTime, metadata) => {
    const duration = Date.now() - startTime;
    logger.info('Performance', {
        operation,
        duration: `${duration}ms`,
        ...metadata
    });
};
// Helper para logs de erro com contexto
export const logError = (error, context) => {
    logger.error('Application Error', {
        message: error.message,
        stack: error.stack,
        context
    });
};
// Métrica simples de contadores em memória
export class MetricsCollector {
    static counters = new Map();
    static gauges = new Map();
    static incrementCounter(name, value = 1) {
        const current = this.counters.get(name) || 0;
        this.counters.set(name, current + value);
    }
    static setGauge(name, value) {
        this.gauges.set(name, value);
    }
    static getMetrics() {
        return {
            counters: Object.fromEntries(this.counters),
            gauges: Object.fromEntries(this.gauges),
            timestamp: new Date().toISOString()
        };
    }
    static reset() {
        this.counters.clear();
        this.gauges.clear();
    }
}
//# sourceMappingURL=logger.js.map