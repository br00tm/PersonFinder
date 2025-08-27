import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Container } from './shared/container.js';
import { logger, requestLogger, MetricsCollector } from './shared/logger.js';
/**
 * Configuração principal da aplicação Express
 * Implementa middlewares de segurança, observabilidade e rate limiting
 */
export function createApp() {
    const app = express();
    const container = Container.getInstance();
    // Middlewares de segurança
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    }));
    // Parser JSON
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));
    // Middleware de logging
    app.use(requestLogger);
    // Rate limiting simples (em produção usar Redis)
    const rateLimit = new Map();
    const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
    const RATE_LIMIT_MAX = 100; // 100 requests por minuto
    app.use((req, res, next) => {
        const clientId = req.ip;
        const now = Date.now();
        const clientLimit = rateLimit.get(clientId);
        if (!clientLimit || now > clientLimit.resetTime) {
            rateLimit.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
            next();
        }
        else if (clientLimit.count < RATE_LIMIT_MAX) {
            clientLimit.count++;
            next();
        }
        else {
            MetricsCollector.incrementCounter('rate_limit_exceeded');
            res.status(429).json({
                success: false,
                error: 'Muitas requisições. Tente novamente em 1 minuto.'
            });
        }
    });
    // Middleware de métricas
    app.use((req, res, next) => {
        MetricsCollector.incrementCounter('http_requests_total');
        MetricsCollector.setGauge('active_connections', 1);
        next();
    });
    // Rotas da aplicação
    const searchController = container.searchController;
    // Health check
    app.get('/health', (req, res) => {
        searchController.healthCheck(req, res);
    });
    // Métricas para monitoramento
    app.get('/metrics', (req, res) => {
        searchController.getMetrics(req, res);
    });
    // Endpoint principal de busca
    app.post('/api/search', (req, res) => {
        searchController.searchPerson(req, res);
    });
    // Rota para informações da API
    app.get('/api/info', (req, res) => {
        res.json({
            service: 'PersonFinder API',
            version: '1.0.0',
            description: 'API para busca de informações pessoais por empresa ou email',
            endpoints: {
                'POST /api/search': 'Buscar pessoa por email ou empresa',
                'GET /health': 'Status da aplicação',
                'GET /metrics': 'Métricas do sistema',
                'GET /api/info': 'Informações da API'
            },
            environment: process.env.NODE_ENV || 'development'
        });
    });
    // Middleware de tratamento de erros global
    app.use((error, req, res, next) => {
        logger.error('Unhandled error', {
            error: error.message,
            stack: error.stack,
            url: req.url,
            method: req.method,
            ip: req.ip
        });
        MetricsCollector.incrementCounter('unhandled_errors_total');
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    });
    // Middleware para rotas não encontradas
    app.use('*', (req, res) => {
        MetricsCollector.incrementCounter('not_found_requests');
        res.status(404).json({
            success: false,
            error: 'Endpoint não encontrado',
            availableEndpoints: [
                'POST /api/search',
                'GET /health',
                'GET /metrics',
                'GET /api/info'
            ]
        });
    });
    return app;
}
//# sourceMappingURL=app.js.map