import { ENV } from './config/env';
import { getDatabase } from './database/db';
import { createWebServer } from './web/server';
import { CronSchedulerService } from './scheduler/cron.scheduler';
import { LoggerService } from './services/logger.service';

async function bootstrap() {
  console.log('===================================================');
  console.log('🌾 AI Facebook Isan Quote Team Multi-Agent System 🌾');
  console.log('===================================================');

  // Step 1: Initialize Database
  try {
    getDatabase();
    LoggerService.info('System', 'SQLite Database Initialized Successfully', { dbPath: ENV.DB_PATH });
  } catch (err: any) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }

  // Step 2: Start Web Server & Dashboard
  const app = createWebServer();
  app.listen(ENV.PORT, () => {
    LoggerService.info('System', `Control Dashboard Web Server Running`, {
      url: `http://localhost:${ENV.PORT}`,
    });
    console.log(`🚀 Control Center Web UI available at: http://localhost:${ENV.PORT}`);
  });

  // Step 3: Start 24/7 Cron Scheduler
  CronSchedulerService.start();

  LoggerService.info('System', 'All 7 AI Agents initialized and ready for automated operations');
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
});
