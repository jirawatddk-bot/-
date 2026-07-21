import { getDatabase } from '../db';
import { AnalyticsEntity } from '../../types';

export class AnalyticsRepository {
  public static insert(record: AnalyticsEntity): number {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO analytics (post_id, reach, likes, comments, shares, followers_gained, engagement_rate, report_period)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      record.post_id,
      record.reach,
      record.likes,
      record.comments,
      record.shares,
      record.followers_gained,
      record.engagement_rate,
      record.report_period || 'DAILY'
    );
    return info.lastInsertRowid as number;
  }

  public static getSummary(): {
    totalPosts: number;
    totalReach: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    avgEngagement: number;
  } {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT 
        COUNT(id) as totalPosts,
        COALESCE(SUM(reach), 0) as totalReach,
        COALESCE(SUM(likes), 0) as totalLikes,
        COALESCE(SUM(comments), 0) as totalComments,
        COALESCE(SUM(shares), 0) as totalShares,
        COALESCE(AVG(engagement_rate), 0) as avgEngagement
      FROM analytics
    `).get() as any;
    return row;
  }

  public static getRecent(limit: number = 20): AnalyticsEntity[] {
    const db = getDatabase();
    return db.prepare('SELECT * FROM analytics ORDER BY id DESC LIMIT ?').all(limit) as AnalyticsEntity[];
  }
}
