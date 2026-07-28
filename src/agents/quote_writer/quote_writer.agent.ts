import { BaseAgent } from '../base.agent';
import { PlannerOutput, QuoteWriterOutput } from '../../types';
import { LLMService } from '../../services/llm.service';
import { QuotesRepository } from '../../database/repositories/quotes.repo';

const ISAN_QUOTE_SAMPLES: QuoteWriterOutput[] = [
  {
    quoteIsan: 'เงินเดือนออกเมื่อเช้า\nตอนเย็นเข้าบัญชีคนอื่น.',
    thaiMeaning: 'เงินเดือนออกเมื่อเช้า ตอนเย็นเข้าบัญชีคนอื่น (จ่ายหนี้หมด)',
    emotion: 'Funny Meme & Relatable',
    keywords: ['เงินเดือนออก', 'หนี้สิน', 'มีมฮาๆ'],
  },
  {
    quoteIsan: 'สิ้นเดือนเหมือนสิ้นใจ\nต้มมาม่ากินทั้งน้ำตา.',
    thaiMeaning: 'สิ้นเดือนเหมือนสิ้นใจ ต้มมาม่ากินทั้งน้ำตา',
    emotion: 'Funny Meme & Relatable',
    keywords: ['สิ้นเดือน', 'มาม่า', 'มีมกวนๆ'],
  },
  {
    quoteIsan: 'หนี้สินมีเป็นแสน\nเงินในบัญชีมีแสนน้อย.',
    thaiMeaning: 'หนี้สินมีเป็นแสน เงินในบัญชีมีแสนน้อย',
    emotion: 'Funny Meme & Satire',
    keywords: ['หนี้สิน', 'มนุษย์เงินเดือน', 'มีมฮาๆ'],
  },
  {
    quoteIsan: 'ของมันต้องมี\nแต่หนี้กะต้องผ่อน.',
    thaiMeaning: 'ของมันต้องมี แต่หนี้ก็ต้องผ่อน',
    emotion: 'Funny Meme & Shopping',
    keywords: ['สายช้อป', 'ของมันต้องมี', 'มีมกวนๆ'],
  },
  {
    quoteIsan: 'รวยชั่วคราว\nจนยาวๆ ถึงสิ้นเดือน.',
    thaiMeaning: 'รวยชั่วคราว ตอนนี้จนยาวๆ ถึงสิ้นเดือน',
    emotion: 'Funny Meme & Relatable',
    keywords: ['เงินเดือนออก', 'สิ้นเดือน', 'มีมฮาๆ'],
  },
  {
    quoteIsan: 'กาแฟแก้วละร้อย\nเหลือเงินแค่สิบบาท.',
    thaiMeaning: 'กาแฟแก้วละร้อย เงินในกระเป๋าเหลือสิบบาท',
    emotion: 'Funny Meme & Coffee',
    keywords: ['ค่ากาแฟ', 'มนุษย์เงินเดือน', 'มีมฮาๆ'],
  },
];

export class IsanQuoteWriterAgent extends BaseAgent<PlannerOutput, QuoteWriterOutput> {
  constructor() {
    super('Isan Quote Writer', 'Northeastern Thai (Isan) Dialect & Funny Meme Creator');
  }

  public async execute(planner: PlannerOutput): Promise<QuoteWriterOutput> {
    this.logInfo('Writing Isan Funny Meme Quote', { topic: planner.dailyTopic, emotion: planner.audienceEmotion });

    const systemPrompt = `You are an Isan (Northeastern Thai) Funny Meme Creator for the Facebook page "เพจ เว้าไปสั่นล่ะ".
Theme: "มีมคำคมฮาๆ" | Style: "อีสานกวนๆ" | Tone: "ตลก เสียดสีชีวิต มนุษย์เงินเดือน หนี้สิน ปลายเดือน แต่ไม่หยาบคาย"

STRICT FORMATTING & CONTENT RULES:
1. Write EXACTLY 2 SHORT PUNCHY LINES (6-10 characters per line). Use \\n to split into 2 lines.
2. ALWAYS use explicit \\n to separate line 1 and line 2 so tone marks/vowels never break!
3. End with a funny Isan Punchline!
4. Target topics: สิ้นเดือน, เงินเดือนออก, เงินหมด, มนุษย์เงินเดือน, หนี้สิน, ของมันต้องมี, มาม่าปลายเดือน, ค่ากาแฟ, ค่าไฟ, รถผ่อน, วันหวยออก
5. Example 1: "เงินเดือนออกเมื่อเช้า\\nตอนเย็นเข้าบัญชีคนอื่น."
6. Example 2: "กาแฟแก้วละร้อย\\nเหลือเงินแค่สิบบาท."
7. Provide exact Central Thai translation (คำแปลภาษาไทยกลางสั้นๆ).
8. Theme must align with today's topic: "${planner.dailyTopic}".`;

    const userPrompt = `Topic: ${planner.dailyTopic}
Audience Emotion: Funny Meme, Humorous, Relatable, Witty

Return JSON with:
{
  "quoteIsan": "ข้อความคำคมมีมอีสานกวนๆ 2 บรรทัดสั้นๆ จบด้วย Punchline (ใช้ \\n แยกบรรทัด)",
  "thaiMeaning": "คำแปลความหมายภาษาไทยกลางสั้นๆ",
  "emotion": "Funny Meme & Relatable",
  "keywords": ["มีมฮาๆ", "คำคมอีสานกวนๆ", "มนุษย์เงินเดือน"]
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
