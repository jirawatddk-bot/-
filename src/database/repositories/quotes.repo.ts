import { getDatabase } from '../db';
import { QuoteEntity } from '../../types';
import crypto from 'crypto';

export class QuotesRepository {
  public static generateHash(quoteIsan: string): string {
    return crypto.createHash('sha256').update(quoteIsan.trim().toLowerCase()).digest('hex');
  }

  public static isDuplicate(quoteIsan: string): boolean {
    const db = getDatabase();
    const hash = this.generateHash(quoteIsan);
    const row = db.prepare('SELECT id FROM quotes WHERE hash_code = ?').get(hash);
    return !!row;
  }

  public static insert(quote: QuoteEntity): number {
    const db = getDatabase();
    const hash = this.generateHash(quote.quote_isan);
    const stmt = db.prepare(`
      INSERT INTO quotes (quote_isan, thai_meaning, emotion, keywords, hash_code)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      quote.quote_isan,
      quote.thai_meaning,
      quote.emotion,
      quote.keywords,
      hash
    );
    return info.lastInsertRowid as number;
  }

  public static findById(id: number): QuoteEntity | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM quotes WHERE id = ?').get(id) as QuoteEntity | undefined;
  }

  public static getRecent(limit: number = 20): QuoteEntity[] {
    const db = getDatabase();
    return db.prepare('SELECT * FROM quotes ORDER BY id DESC LIMIT ?').all(limit) as QuoteEntity[];
  }
}
