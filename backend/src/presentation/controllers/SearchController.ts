import type { Request, Response } from 'express';
import { SearchPersonUseCase } from '../../application/usecases/SearchPersonUseCase.js';
import type { SearchPersonRequest } from '../../application/usecases/SearchPersonUseCase.js';
import { logger, logError, logPerformance, MetricsCollector } from '../../shared/logger.js';

/**
 * Controller para endpoints de busca
 * Camada de apresentação seguindo Clean Architecture
 */
export class SearchController {
  constructor(
    private readonly searchPersonUseCase: SearchPersonUseCase
  ) {}

  async searchPerson(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      MetricsCollector.incrementCounter('search_requests_total');

      const { query, type } = req.body;
      
      // Validação básica
      if (!query || !type) {
        MetricsCollector.incrementCounter('search_requests_invalid');
        res.status(400).json({
          success: false,
          error: 'Query e type são obrigatórios'
        });
        return;
      }

      // Log da requisição
      logger.info('Search request received', {
        query: type === 'email' ? query : '[COMPANY_NAME]', // Não logga empresa para privacidade
        type,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      const request: SearchPersonRequest = { query, type };
      const result = await this.searchPersonUseCase.execute(request);

      // Métricas baseadas no resultado
      if (result.success) {
        MetricsCollector.incrementCounter('search_requests_successful');
        
        if (result.cached) {
          MetricsCollector.incrementCounter('search_cache_hits');
        } else {
          MetricsCollector.incrementCounter('search_cache_misses');
        }
      } else {
        MetricsCollector.incrementCounter('search_requests_failed');
      }

      // Log de performance
      logPerformance('search_person', startTime, {
        success: result.success,
        cached: result.cached,
        hasData: !!result.data
      });

      res.json(result);

    } catch (error) {
      MetricsCollector.incrementCounter('search_requests_error');
      
      logError(error as Error, {
        endpoint: 'search_person',
        body: req.body,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      };

      logger.debug('Health check requested', healthData);
      res.json(healthData);

    } catch (error) {
      logError(error as Error, { endpoint: 'health_check' });
      
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = MetricsCollector.getMetrics();
      
      // Formato compatível com Prometheus (texto simples)
      const prometheusFormat = this.formatPrometheusMetrics(metrics);
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(prometheusFormat);

    } catch (error) {
      logError(error as Error, { endpoint: 'metrics' });
      res.status(500).send('# Error retrieving metrics');
    }
  }

  private formatPrometheusMetrics(metrics: any): string {
    let output = '';
    
    // Contadores
    for (const [name, value] of Object.entries(metrics.counters)) {
      output += `# TYPE ${name} counter\n`;
      output += `${name} ${value}\n`;
    }
    
    // Gauges
    for (const [name, value] of Object.entries(metrics.gauges)) {
      output += `# TYPE ${name} gauge\n`;
 