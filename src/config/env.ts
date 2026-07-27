import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '../../database/isan_quotes.db'),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'openai',
  FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID || '',
  FACEBOOK_PAGE_ACCESS_TOKEN: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
  FACEBOOK_DRY_RUN: process.env.FACEBOOK_DRY_RUN !== 'false',
  CRON_SCHEDULE: process.env.CRON_SCHEDULE || '0 */6 * * *',
  AUTO_SCHEDULE_ENABLED: process.env.AUTO_SCHEDULE_ENABLED !== 'false',
};
