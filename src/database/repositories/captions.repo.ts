import { getDatabase } from '../db';
import { CaptionEntity } from '../../types';

export class CaptionsRepository {
  public static insert(caption: CaptionEntity): number {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO captions (opening_hook, body, cta, emojis, hashtags)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      caption.opening_hook,
      caption.body,
      caption.cta,
      caption.emojis,
      caption.hashtags
    );
    return info.lastInsertRowid as number;
  }

  public static findById(id: number): CaptionEntity | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM captions WHERE id = ?').get(id) as CaptionEntity | undefined;
  }
}
