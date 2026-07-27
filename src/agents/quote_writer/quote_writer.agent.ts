import { BaseAgent } from '../base.agent';
import { PlannerOutput, QuoteWriterOutput } from '../../types';
import { LLMService } from '../../services/llm.service';

const DOG_KNOWLEDGE_SAMPLES: QuoteWriterOutput[] = [
  {
    quoteIsan: "หน้าฝนเปียกชื้น! อย่าลืมเช็ดอุ้งเท้าน้องหมาให้แห้งสนิทหลังเดินเล่น ป้องกันเชื้อราและโรคผิวหนังอักเสบ",
    thaiMeaning: "หน้าฝนเปียกชื้น! อย่าลืมเช็ดอุ้งเท้าน้องหมาให้แห้งสนิทหลังเดินเล่น ป้องกันเชื้อราและโรคผิวหนังอักเสบ",
    emotion: "Caring & Informative",
    keywords: ["ดูแลสุนัขหน้าฝน", "เช็ดอุ้งเท้า", "ป้องกันเชื้อรา", "สุขภาพสุนัขพันธุ์เล็ก"],
  },
  {
    quoteIsan: "สุนัขหน้าสั้น (French Bulldog/Pug) เสี่ยงฮีตสโตรกง่ายในฤดูร้อน! ควรให้อยู่ในห้องแอร์หรือพื้นที่ถ่ายเทสะดวก",
    thaiMeaning: "สุนัขหน้าสั้น (French Bulldog/Pug) เสี่ยงฮีตสโตรกง่ายในฤดูร้อน! ควรให้อยู่ในห้องแอร์หรือพื้นที่ถ่ายเทสะดวก",
    emotion: "Urgent & Educational",
    keywords: ["ฮีตสโตรกในสุนัข", "FrenchBulldog", "สุนัขหน้าสั้น", "วิธีคลายร้อนสุนัข"],
  },
  {
    quoteIsan: "ลูกสุนัขกัดเฟอร์นิเจอร์? ใช้ของเล่นยางสำหรับขัดฟัน และชวนเล่นเชิงบวก แทนการลงโทษด้วยความรุนแรง",
    thaiMeaning: "ลูกสุนัขกัดเฟอร์นิเจอร์? ใช้ของเล่นยางสำหรับขัดฟัน และชวนเล่นเชิงบวก แทนการลงโทษด้วยความรุนแรง",
    emotion: "Helpful & Encouraging",
    keywords: ["ฝึกลูกสุนัข", "ลูกสุนัขคันฟัน", "การฝึกเชิงบวก", "ของเล่นสุนัข"],
  },
];

export class DogKnowledgeWriterAgent extends BaseAgent<PlannerOutput, QuoteWriterOutput> {
  constructor() {
    super('Dog Knowledge Writer', 'Dog Expert & Pet Health Specialist');
  }

  public async execute(planner: PlannerOutput): Promise<QuoteWriterOutput> {
    this.logInfo('Writing Dog Knowledge Tip', { topic: planner.dailyTopic, emotion: planner.audienceEmotion });

    const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านสุขภาพ พฤติกรรม และการดูแลสุนัขพันธุ์เล็ก (Dog Health & Behavior Specialist)
หน้าที่ของคุณคือเขียน "สาระน่ารู้และทริคดูแลน้องหมา" ที่ถูกต้อง น่าสนใจ เข้าใจง่าย สำหรับคนรักสุนัขเพจ "โปรดเรียกผมว่า..นายท่านปั้น"
ข้อกำหนด:
1. ห้ามเขียนคำคมชีวิตหรือคำคมอีสานเด็ดขาด!
2. เน้นเคล็ดลับดูแลสุนัขพันธุ์เล็ก (เช่น French Bulldog, Pomeranian, Poodle, Chihuahua)
3. เขียนสั้น กระชับ อ่านจบใน 1-2 ประโยค เพื่อนำไปใส่ในภาพการ์ดความรู้น่ารักๆ`;

    const userPrompt = `Topic: ${planner.dailyTopic}
Audience Emotion: ${planner.audienceEmotion}

Return JSON with:
{
  "quoteIsan": "สาระน่ารู้สั้นๆ เรื่องน้องหมา 1-2 ประโยค",
  "thaiMeaning": "คำอธิบายหรือที่มาของทริคนี้สั้นๆ",
  "emotion": "${planner.audienceEmotion}",
  "keywords": ["ดูแลสุนัข", "ทาสหมา", "สุนัขพันธุ์เล็ก"]
}`;

    const fallbackIndex = Math.floor(Math.random() * DOG_KNOWLEDGE_SAMPLES.length);
    const sample = DOG_KNOWLEDGE_SAMPLES[fallbackIndex];
    const fallback: QuoteWriterOutput = {
      ...sample,
      quoteIsan: sample.quoteIsan,
      thaiMeaning: sample.thaiMeaning,
    };

    return await LLMService.generateJSON<QuoteWriterOutput>(systemPrompt, userPrompt, () => fallback);
  }
}
