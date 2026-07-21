import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { ENV } from '../config/env';
import { LogsRepository } from '../database/repositories/logs.repo';
import { PostsRepository } from '../database/repositories/posts.repo';
import { AnalyticsRepository } from '../database/repositories/analytics.repo';
import { QuotesRepository } from '../database/repositories/quotes.repo';
import { CronSchedulerService } from '../scheduler/cron.scheduler';
import { TopicScheduleService } from '../services/topic_schedule.service';

export function createWebServer(): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Determine public folder location (supports both ts-node and compiled dist execution)
  const candidatePublicPaths = [
    path.join(process.cwd(), 'src/web/public'),
    path.join(__dirname, 'public'),
    path.join(__dirname, '../../src/web/public'),
    path.join(process.cwd(), 'dist/web/public'),
  ];

  let publicDir = candidatePublicPaths[0];
  for (const p of candidatePublicPaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
      publicDir = p;
      break;
    }
  }

  app.use(express.static(publicDir));

  // Explicit route handler for root /
  app.get('/', (req, res) => {
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.send('<h1>Isan AI Team API Server Running</h1><p>Public UI index.html not found.</p>');
    }
  });

  // REST API Endpoints

  // Trigger manual workflow execution with optional custom topic
  app.post('/api/trigger-workflow', async (req, res) => {
    try {
      const { customTopic } = req.body || {};
      const result = await CronSchedulerService.triggerManualRun(customTopic);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get 7-day weekly topic schedule
  app.get('/api/weekly-topics', (req, res) => {
    const schedule = TopicScheduleService.getSchedule();
    res.json({ success: true, schedule });
  });

  // Update 7-day weekly topic schedule
  app.post('/api/weekly-topics', (req, res) => {
    try {
      const { schedule } = req.body || {};
      if (!schedule) {
        return res.status(400).json({ success: false, error: 'Schedule object is required' });
      }
      TopicScheduleService.saveSchedule(schedule);
      res.json({ success: true, message: 'ตารางหัวข้อประจำวันถูกบันทึกเรียบร้อยแล้ว' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get real-time system logs
  app.get('/api/logs', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const logs = LogsRepository.getLogs(limit);
    res.json({ success: true, logs });
  });

  // Get generated post history
  app.get('/api/posts', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const posts = PostsRepository.getFullPosts(limit);
    res.json({ success: true, posts });
  });

  // Get analytics summary & recent metrics
  app.get('/api/analytics', (req, res) => {
    const summary = AnalyticsRepository.getSummary();
    const recent = AnalyticsRepository.getRecent(20);
    res.json({ success: true, summary, recent });
  });

  // Get quote library
  app.get('/api/quotes', (req, res) => {
    const quotes = QuotesRepository.getRecent(50);
    res.json({ success: true, quotes });
  });

  // Get system environment configuration
  app.get('/api/config', (req, res) => {
    res.json({
      success: true,
      config: {
        PORT: ENV.PORT,
        NODE_ENV: ENV.NODE_ENV,
        LLM_PROVIDER: ENV.LLM_PROVIDER,
        FACEBOOK_PAGE_ID: ENV.FACEBOOK_PAGE_ID ? 'Configured ✅' : 'Not Set ⚠️',
        FACEBOOK_DRY_RUN: ENV.FACEBOOK_DRY_RUN,
        CRON_SCHEDULE: ENV.CRON_SCHEDULE,
        AUTO_SCHEDULE_ENABLED: ENV.AUTO_SCHEDULE_ENABLED,
      },
    });
  });

  return app;
}
