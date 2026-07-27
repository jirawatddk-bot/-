import { getDatabase } from '../db';
import { LogEntity, HistoryEntity } from '../../types';

export class LogsRepository {
  public static log(agentName: string, level: 'INFO' | 'WARN' | 'ERROR', action: string, details: any): void {
    const db = getDatabase();
    const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
    const stmt = db.prepare(`
      INSERT INTO logs (agent_name, level, action, details)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(agentName, level, action, detailsStr);
    console.log(`[${new Date().toISOString()}] [${level}] [${agentName}] ${action}: ${detailsStr.slice(0, 150)}`);
  }

  public static getLogs(limit: number = 50): LogEntity[] {
    const db = getDatabase();
    return db.prepare('SELECT * FROM logs ORDER BY id DESC LIMIT ?').all(limit) as LogEntity[];
  }

  public static saveHistory(actionType: string, payload: any): void {
    const db = getDatabase();
    const payloadJson = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const stmt = db.prepare(`
      INSERT INTO history (action_type, payload_json)
      VALUES (?, ?)
    `);
    stmt.run(actionType, payloadJson);
  }
}
