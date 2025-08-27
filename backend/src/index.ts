import 'dotenv/config';
import { createApp } from './app.js';
import { logger } from './shared/logger.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Ponto de entrada da aplicação
 * Configuração de inicialização e graceful shutdown
 */

// Criação do diretório de logs se não existir
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  try {
    const app = createApp();

    const server = app.listen(PORT, HOST, () => {
      logger.info('Server started', {
        port: PORT,
        host: HOST,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        processId: process.pid
      });

      console.log(`🚀 PersonFinder Backend rodando em http://${HOST}:${PORT}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
      console.log(`📈 Métricas: http://${HOST}:${PORT}/metrics`);
      console.log(`🔍 API: http://${HOST}:${PORT}/api/search`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info('Shutdown signal received', { signal });
      
      server.close((err: any) => {
        if (err) {
          logger.error('Error during server shutdown', { error: err.message });
          process.exit(1);
        }
        
        logger.info('Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Tratamento de exceções não capturadas
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });
      
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined
      });
      
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    process.exit(1);
  }
}

// Inicializa servidor
startServer();
