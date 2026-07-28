import { BaseAgent } from '../base.agent';
import { PlannerOutput, QuoteWriterOutput } from '../../types';
import { LLMService } from '../../services/llm.service';

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

    const fallbackIndex = Math.floor(Math.random() * ISAN_QUOTE_SAMPLES.length);
    const sample = ISAN_QUOTE_SAMPLES[fallbackIndex];
    const timeTag = new Date().toLocaleTimeString('th-TH');
    const fallback: QuoteWriterOutput = {
      ...sample,
      quoteIsan: `${sample.quoteIsan} (อัปเดต ${timeTag})`,
      thaiMeaning: `${sample.thaiMeaning} (อัปเดต ${timeTag})`,
    };

    return await LLMService.generateJSON<QuoteWriterOutput>(systemPrompt, userPrompt, () => fallback);
  }
}
