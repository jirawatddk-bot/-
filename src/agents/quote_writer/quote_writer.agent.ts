import { BaseAgent } from '../base.agent';
import { PlannerOutput, QuoteWriterOutput } from '../../types';
import { LLMService } from '../../services/llm.service';
import { QuotesRepository } from '../../database/repositories/quotes.repo';

const ISAN_QUOTE_SAMPLES: QuoteWriterOutput[] = [
  {
    quoteIsan: 'ชีวิตมันบ่มีคำว่าสบายตั้งแต่เกิด แต่เฮาเลือกสิสู้ให้มันซำบายในวันข้างหน้าได้',
    thaiMeaning: 'ชีวิตไม่มีคำว่าสบายตั้งแต่เกิด แต่เราเลือกที่จะสู้ให้มันสบายในวันข้างหน้าได้',
    emotion: 'Motivational & Strong',
    keywords: ['สู้ชีวิต', 'กำลังใจ', 'คำคมอีสาน'],
  },
  {
    quoteIsan: 'ความฮักกะคือการปลูกข้าว ต้องอดทนถ่าเวลา ถึงสิยากลำบากแต่ผลผลิตกะคุ้มค่า',
    thaiMeaning: 'ความรักก็เหมือนการทำนาปลูกข้าว ต้องอดทนรอเวลา ถึงจะยากลำบากแต่ผลผลิตก็คุ้มค่า',
    emotion: 'Wise & Romantic',
    keywords: ['ความรัก', 'ทำนา', 'ความอดทน'],
  },
  {
    quoteIsan: 'มื้อนี้เหนื่อยบ่เป็นหยัง ขอแค่ใจเฮาบ่ถอย พรุ่งนี้กะเป็นวันของเฮาคือเก่า',
    thaiMeaning: 'วันนี้เหนื่อยไม่เป็นไร ขอแค่ใจเราไม่ถอย พรุ่งนี้ก็เป็นวันของเราเหมือนเดิม',
    emotion: 'Encouraging & Warm',
    keywords: ['กำลังใจ', 'ไม่ถอย', 'สู้ต่อไป'],
  },
  {
    quoteIsan: 'ฮักแท้บ่แม่นการครอบครอง แต่คือการเห็นคนที่เฮาฮักมีความสุขยิ้มได้ในทุกวัน',
    thaiMeaning: 'รักแท้ไม่ใช่การครอบครอง แต่คือการเห็นคนที่เรารักมีความสุขยิ้มได้ในทุกวัน',
    emotion: 'Heartwarming',
    keywords: ['รักแท้', 'ความสุข', 'ความฮัก'],
  },
  {
    quoteIsan: 'ก้าวเล็กๆ ในวันนี้ ดีกว่ายืนอยู่ที่เดิมบ่ได้เริ่มทำอะไรเลยสักอย่าง',
    thaiMeaning: 'ก้าวเล็กๆ ในวันนี้ ดีกว่ายืนอยู่ที่เดิมไม่ได้เริ่มทำอะไรเลยสักอย่าง',
    emotion: 'Inspiring',
    keywords: ['เริ่มต้นใหม่', 'กำลังใจ', 'ข้อคิด'],
  },
  {
    quoteIsan: 'ฮักเขาข้างเดียวถึงสิเจ็บ แต่กะดีกว่าบ่เคยฮู้จักความฮักเลยในชีวิต',
    thaiMeaning: 'รักเขาข้างเดียวถึงจะเจ็บ แต่ก็ดีกว่าไม่เคยรู้จักความรักเลยในชีวิต',
    emotion: 'Romantic Melancholy',
    keywords: ['แอบรัก', 'ความรัก', 'ข้อคิด'],
  },
];

export class IsanQuoteWriterAgent extends BaseAgent<PlannerOutput, QuoteWriterOutput> {
  constructor() {
    super('Isan Quote Writer', 'Northeastern Thai (Isan) Dialect & Cultural Poet');
  }

  public async execute(planner: PlannerOutput): Promise<QuoteWriterOutput> {
    this.logInfo('Writing Isan Quote', { topic: planner.dailyTopic, emotion: planner.audienceEmotion });

    const systemPrompt = `You are a native Isan (Northeastern Thai) poet and quote creator for the Facebook page "เพจ เว้าไปสั่นล่ะ".
Your duty is to compose 100% ORIGINAL, DEEP, TOUCHING, AND MEMORABLE Isan quotes (คำคมภาษาอีสานแท้).

RULES:
1. Write 1-2 punchy lines in authentic Isan dialect (ภาษาอีสาน).
2. Provide exact Central Thai translation (คำแปลภาษาไทยกลาง).
3. Theme must align with today's topic: "${planner.dailyTopic}".
4. Make it viral, emotional, warm, and inspiring.`;

    const userPrompt = `Topic: ${planner.dailyTopic}
Audience Emotion: ${planner.audienceEmotion}

Return JSON with:
{
  "quoteIsan": "ข้อความคำคมภาษาอีสาน 1-2 ประโยคเด็ดๆ",
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
