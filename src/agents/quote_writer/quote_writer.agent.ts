import { BaseAgent } from '../base.agent';
import { PlannerOutput, QuoteWriterOutput } from '../../types';
import { LLMService } from '../../services/llm.service';
import { QuotesRepository } from '../../database/repositories/quotes.repo';

const ISAN_QUOTE_SAMPLES: QuoteWriterOutput[] = [
  {
    quoteIsan: 'ใจต้องสู้\nฝันต้องถึง.',
    thaiMeaning: 'ใจต้องสู้ ฝันต้องถึง',
    emotion: 'Motivational & Strong',
    keywords: ['สู้ชีวิต', 'กำลังใจ', 'คำคมอีสาน'],
  },
  {
    quoteIsan: 'สู้บ่ถอย\nรอวันชนะ.',
    thaiMeaning: 'สู้ไม่ถอย รอวันชนะ',
    emotion: 'Encouraging & Warm',
    keywords: ['สู้ชีวิต', 'กำลังใจ', 'ข้อคิด'],
  },
  {
    quoteIsan: 'อดทนถ่า\nวันของเฮา.',
    thaiMeaning: 'อดทนรอ วันของเรา',
    emotion: 'Wise & Hopeful',
    keywords: ['ความอดทน', 'ความหวัง', 'สู้ต่อไป'],
  },
  {
    quoteIsan: 'ยิ้มสู้ไป\nใจอย่าถอย.',
    thaiMeaning: 'ยิ้มสู้ไป ใจอย่าถอย',
    emotion: 'Encouraging & Warm',
    keywords: ['กำลังใจ', 'ยิ้มสู้', 'สู้ต่อไป'],
  },
  {
    quoteIsan: 'ฮักบ่ลืม\nคิดถึงบ่หาย.',
    thaiMeaning: 'รักไม่ลืม คิดถึงไม่หาย',
    emotion: 'Romantic & Sweet',
    keywords: ['ความรัก', 'ความคิดถึง', 'ข้อคิด'],
  },
];

export class IsanQuoteWriterAgent extends BaseAgent<PlannerOutput, QuoteWriterOutput> {
  constructor() {
    super('Isan Quote Writer', 'Northeastern Thai (Isan) Dialect & Cultural Poet');
  }

  public async execute(planner: PlannerOutput): Promise<QuoteWriterOutput> {
    this.logInfo('Writing Isan Quote', { topic: planner.dailyTopic, emotion: planner.audienceEmotion });

    const systemPrompt = `You are a native Isan (Northeastern Thai) poet and quote creator for the Facebook page "เพจ เว้าไปสั่นล่ะ".
Your duty is to compose ULTRA-SHORT, DEEP, PUNCHY, AND MEMORABLE 2-LINE Isan quotes (คำคมสั้นๆ 2 บรรทัด).

STRICT ULTRA-SHORT RULES:
1. Write VERY SHORT 2 LINES (Maximum 6-10 characters per line, max 2-4 words per line). Use \\n to split lines.
2. Example 1: "ใจต้องสู้\\nฝันต้องถึง."
3. Example 2: "สู้บ่ถอย\\nรอวันชนะ."
4. Example 3: "ฮักบ่ลืม\\nคิดถึงบ่หาย."
5. Provide exact Central Thai translation (คำแปลภาษาไทยกลางสั้นๆ).
6. Theme must align with today's topic: "${planner.dailyTopic}".`;

    const userPrompt = `Topic: ${planner.dailyTopic}
Audience Emotion: ${planner.audienceEmotion}

Return JSON with:
{
  "quoteIsan": "ข้อความคำคมสั้นมาก 2 บรรทัด (ใช้ \\n แยกบรรทัด)",
  "thaiMeaning": "คำแปลความหมายภาษาไทยกลางสั้นๆ",
  "emotion": "${planner.audienceEmotion}",
  "keywords": ["คำคมอีสาน", "สู้ชีวิต", "กำลังใจ"]
}`;

    // Filter out samples that are already posted in DB
    const nonDuplicates = ISAN_QUOTE_SAMPLES.filter(sample => {
      const hash = QuotesRepository.generateHash(sample.quoteIsan);
      return !QuotesRepository.isDuplicate(hash);
    });

    const pool = nonDuplicates.length > 0 ? nonDuplicates : ISAN_QUOTE_SAMPLES;
    const fallbackIndex = Math.floor(Math.random() * pool.length);
    const sample = pool[fallbackIndex];

    const fallback: QuoteWriterOutput = {
      ...sample,
      quoteIsan: sample.quoteIsan,
      thaiMeaning: sample.thaiMeaning,
    };

    return await LLMService.generateJSON<QuoteWriterOutput>(systemPrompt, userPrompt, () => fallback);
  }
}
