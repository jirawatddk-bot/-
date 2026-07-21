import fs from 'fs';
import path from 'path';

export interface DayTopicItem {
  dayName: string;
  topic: string;
}

export type WeeklyTopicSchedule = Record<string, DayTopicItem>;

export class TopicScheduleService {
  private static FILE_PATH = path.join(__dirname, '../config/weekly_topics.json');

  public static getSchedule(): WeeklyTopicSchedule {
    try {
      if (fs.existsSync(this.FILE_PATH)) {
        const raw = fs.readFileSync(this.FILE_PATH, 'utf-8');
        return JSON.parse(raw) as WeeklyTopicSchedule;
      }
    } catch (err) {
      console.warn('Failed to read weekly_topics.json:', err);
    }

    return {
      '0': { dayName: 'วันอาทิตย์', topic: 'ปัญญาและคติธรรมคำสอน' },
      '1': { dayName: 'วันจันทร์', topic: 'กำลังใจ สู้ชีวิต' },
      '2': { dayName: 'วันอังคาร', topic: 'ความรัก ความคิดถึง' },
      '3': { dayName: 'วันพุธ', topic: 'สัจธรรมชีวิตและความกตัญญู' },
      '4': { dayName: 'วันพฤหัสบดี', topic: 'ครอบครัวและความอบอุ่น' },
      '5': { dayName: 'วันศุกร์', topic: 'ตลก เฮฮา หยอกล้อ' },
      '6': { dayName: 'วันเสาร์', topic: 'วิถีชีวิตบ้านนาและวัฒนธรรม' },
    };
  }

  public static saveSchedule(newSchedule: WeeklyTopicSchedule): void {
    try {
      const dir = path.dirname(this.FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.FILE_PATH, JSON.stringify(newSchedule, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save weekly_topics.json:', err);
      throw err;
    }
  }

  public static getTopicForDay(dayIndex: number): string {
    const schedule = this.getSchedule();
    const item = schedule[dayIndex.toString()];
    return item ? item.topic : 'กำลังใจ สู้ชีวิต';
  }
}
