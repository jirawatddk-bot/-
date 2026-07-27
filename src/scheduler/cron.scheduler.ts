import cron from 'node-cron';
import { ENV } from '../config/env';
import { CEOAgent } from '../agents/ceo/ceo.agent';
import { LoggerService } from '../services/logger.service';

export class CronSchedulerService {
  private static task: cron.ScheduledTask | null = null;
  private static ceoAgent: CEOAgent = new CEOAgent();

  public static start(): void {
    if (!ENV.AUTO_SCHEDULE_ENABLED) {
      LoggerService.info('CronScheduler', 'Automatic schedule is disabled in configuration');
      return;
    }

    if (this.task) {
      this.task.stop();
    }

    LoggerService.info('CronScheduler', `Starting 24/7 Automated Cron Scheduler with expression: "${ENV.CRON_SCHEDULE}"`);

    this.task = cron.schedule(ENV.CRON_SCHEDULE, async () => {
      LoggerService.info('CronScheduler', 'Triggering Scheduled AI Agent Workflow Execution');
      try {
        await this.ceoAgent.execute();
      } catch (err: any) {
        LoggerService.error('CronScheduler', 'Error executing scheduled workflow', { error: err.message });
      }
    });
  }

  public static stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      LoggerService.info('CronScheduler', 'Cron Scheduler stopped');
    }
  }

  public static async triggerManualRun(customTopic?: string) {
    LoggerService.info('CronScheduler', 'Manual Execution Triggered via API / UI', { customTopic });
    return await this.ceoAgent.execute({ customTopic });
  }
}
