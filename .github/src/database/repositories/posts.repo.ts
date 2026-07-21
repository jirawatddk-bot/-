import { getDatabase } from '../db';
import { PostEntity } from '../../types';

export class PostsRepository {
  public static insert(post: PostEntity): number {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO posts (quote_id, caption_id, image_prompt_id, status, scheduled_at, published_at, fb_post_id, error_log)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      post.quote_id,
      post.caption_id,
      post.image_prompt_id,
      post.status,
      post.scheduled_at || null,
      post.published_at || null,
      post.fb_post_id || null,
      post.error_log || null
    );
    return info.lastInsertRowid as number;
  }

  public static updateStatus(id: number, status: PostEntity['status'], fbPostId?: string, errorLog?: string): void {
    const db = getDatabase();
    const publishedAt = status === 'PUBLISHED' ? new Date().toISOString() : null;
    const stmt = db.prepare(`
      UPDATE posts
      SET status = ?, published_at = COALESCE(?, published_at), fb_post_id = COALESCE(?, fb_post_id), error_log = COALESCE(?, error_log)
      WHERE id = ?
    `);
    stmt.run(status, publishedAt, fbPostId || null, errorLog || null, id);
  }

  public static findById(id: number): PostEntity | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as PostEntity | undefined;
  }

  public static getFullPosts(limit: number = 20): any[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT 
        p.id as post_id,
        p.status,
        p.scheduled_at,
        p.published_at,
        p.fb_post_id,
        p.created_at,
        q.quote_isan,
        q.thai_meaning,
        q.emotion,
        c.opening_hook,
        c.body,
        c.cta,
        c.emojis,
        c.hashtags,
        ip.prompt as image_prompt,
        ip.style as image_style
      FROM posts p
      JOIN quotes q ON p.quote_id = q.id
      JOIN captions c ON p.caption_id = c.id
      JOIN image_prompts ip ON p.image_prompt_id = ip.id
      ORDER BY p.id DESC
      LIMIT ?
    `).all(limit);
  }
}
