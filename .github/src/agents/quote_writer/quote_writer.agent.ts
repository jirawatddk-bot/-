import { BaseAgent } from '../base.agent';
import { PlannerOutput, QuoteWriterOutput } from '../../types';
import { LLMService } from '../../services/llm.service';

const ISAN_QUOTE_SAMPLES: QuoteWriterOutput[] = [
  {
    quoteIsan: "มื้อนี้อาจสิเหนื่อย แต่กะบ่เคยคิดสิถอย เพราะคนข้างหลังยังถ่าความสำเร็จของเฮาอยู่",
    thaiMeaning: "วันนี้อาจจะเหนื่อย แต่ก็ไม่เคยคิดจะท้อถอย เพราะคนข้างหลังยังรอคอยความสำเร็จของเราอยู่",
    emotion: "Inspiring & Strong",
    keywords: ["เหนื่อย", "บ่ถอย", "ความสำเร็จ", "คนข้างหลัง"],
  },
  {
    quoteIsan: "คิดฮอดบ้านเฮาเวลาเหนื่อยล้า กลิ่นดินกลิ่นทุ่งนาคือกำลังใจชั้นดี",
    thaiMeaning: "คิดถึงบ้านเราเวลาเหนื่อยล้า กลิ่นดินกลิ่นทุ่งนาคือกำลังใจชั้นดี",
    emotion: "Nostalgic & Warm",
    keywords: ["คิดฮอดบ้าน", "ทุ่งนา", "กำลังใจ", "กลิ่นดิน"],
  },
  {
    quoteIsan: "ความฮักกะคือการปลูกข้าว ต้องอดทนถ่าเวลา ถึงสิยากลำบากแต่ผลผลิตกะคุ้มค่า",
    thaiMeaning: "ความรักก็เหมือนการทำนาปลูกข้าว ต้องอดทนรอเวลา ถึงจะยากลำบากแต่ผลผลิตก็คุ้มค่า",
    emotion: "Wise & Romantic",
    keywords: ["ความฮัก", "ปลูกข้าว", "อดทน", "คุ้มค่า"],
  },
  {
    quoteIsan: "ชีวิตมันบ่มีคำว่าสบายตั้งแต่เกิด แต่เฮาเลือกสิสู้ให้มันซำบายในวันข้างหน้าได้",
    thaiMeaning: "ชีวิตไม่มีคำว่าสบายตั้งแต่เกิด แต่เราเลือกที่จะสู้ให้มันสบายในวันข้างหน้าได้",
    emotion: "Motivational",
    keywords: ["ชีวิต", "สู้", "ซำบาย", "วันข้างหน้า"],
  },
];

export class IsanQuoteWriterAgent extends BaseAgent<PlannerOutput, QuoteWriterOutput> {
  constructor() {
    super('Isan Quote Writer', 'Professional Isan Quote Creator');
  }

  public async execute(planner: PlannerOutput): Promise<QuoteWriterOutput> {
    this.logInfo('Writing Isan Quote', { topic: planner.dailyTopic, emotion: planner.audienceEmotion });

    const systemPrompt = `You are a master Isan (Northeastern Thai) poet and quote creator.
Your job is to generate 100% ORIGINAL, highly authentic, emotional, short, and memorable Isan language quotes.
Rules:
- NEVER copy internet quotes or common cliches.
- Use authentic, natural Isan words (e.g., ฮัก, คิดฮอด, มื้อนี้, บ่ถอย, ซำบาย, ถ่า, บ้านเฮา).
- Provide the exact Central Thai translation (thaiMeaning).
- Keep it short, powerful, shareable on Facebook image cards.`;

    const userPrompt = `Topic: ${planner.dailyTopic}
Theme: ${planner.weeklyTheme}
Audience Emotion: ${planner.audienceEmotion}

Return JSON with:
{
  "quoteIsan": "original Isan quote",
  "thaiMeaning": "Central Thai meaning",
  "emotion": "${planner.audienceEmotion}",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const fallbackIndex = Math.floor(Math.random() * ISAN_QUOTE_SAMPLES.length);
    const fallback = ISAN_QUOTE_SAMPLES[fallbackIndex];

    return await LLMService.generateJSON<QuoteWriterOutput>(systemPrompt, userPrompt, () => fallback);
  }
}
