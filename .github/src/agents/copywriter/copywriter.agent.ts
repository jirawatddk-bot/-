import { BaseAgent } from '../base.agent';
import { QuoteWriterOutput, CopywriterOutput } from '../../types';
import { COMMON_ISAN_HASHTAGS } from '../../config/constants';
import { LLMService } from '../../services/llm.service';

export interface CopywriterInput {
  quote: QuoteWriterOutput;
  dailyTopic: string;
}

export class FacebookCopywriterAgent extends BaseAgent<CopywriterInput, CopywriterOutput> {
  constructor() {
    super('Facebook Copywriter', 'Facebook Content Specialist');
  }

  public async execute(input: CopywriterInput): Promise<CopywriterOutput> {
    this.logInfo('Crafting Short Facebook Caption with 6 Hashtags', { quote: input.quote.quoteIsan });

    const systemPrompt = `You are the Official Facebook Copywriter for the dog lovers page named "โปรดเรียกผมว่า..นายท่านปั้น".
CRITICAL RULES:
1. Write cute, engaging, warm Facebook captions for dog owners and pet lovers (Maximum 2-3 short sentences).
2. Use friendly pet lover tone of voice.
3. You MUST return EXACTLY 6 HASHTAGS.
4. The FIRST HASHTAG MUST BE "#โปรดเรียกผมว่านายท่านปั้น".`;

    const userPrompt = `Dog Knowledge Tip: "${input.quote.quoteIsan}"
Topic: ${input.dailyTopic}

Return JSON:
{
  "openingHook": "ประโยคเปิดตัวน่ารักๆ สำหรับทาสหมา 🐶❤️",
  "body": "",
  "cta": "ประโยคเชิญชวนกดคอมเมนต์กดแชร์น่ารักๆ 🐾",
  "emojis": ["🐶", "❤️", "🐾"],
  "hashtags": ["#โปรดเรียกผมว่านายท่านปั้น", "#ทาสหมา", "#สุนัขพันธุ์เล็ก", "#คนรักสุนัข", "#ดูแลสุนัข", "#น้องหมาน่ารัก"]
}`;

    const fallbackHashtags = ['#โปรดเรียกผมว่านายท่านปั้น', '#ทาสหมา', '#สุนัขพันธุ์เล็ก', '#คนรักสุนัข', '#ดูแลสุนัข', '#น้องหมาน่ารัก'];

    const fallback: CopywriterOutput = {
      openingHook: `🐶 สวัสดีครับพี่ๆ ทาสหมา วันนี้ปั้นเอาทริคดูแลสุขภาพน้องหมามาฝากครับ ❤️`,
      body: '',
      cta: '🐾 อย่าลืมเซฟไว้ดูแลน้องหมาที่บ้าน และกดแชร์แบ่งปันให้เพื่อนๆ ทาสหมากันด้วยน้า✨',
      emojis: ['🐶', '❤️', '🐾', '✨'],
      hashtags: fallbackHashtags,
    };

    const output = await LLMService.generateJSON<CopywriterOutput>(systemPrompt, userPrompt, () => fallback);

    // Enforce #โปรดเรียกผมว่านายท่านปั้น as first hashtag and ensure exactly 6 hashtags
    let finalHashtags = output.hashtags || [];
    if (!finalHashtags.includes('#โปรดเรียกผมว่านายท่านปั้น')) {
      finalHashtags.unshift('#โปรดเรียกผมว่านายท่านปั้น');
    } else {
      finalHashtags = ['#โปรดเรียกผมว่านายท่านปั้น', ...finalHashtags.filter(h => h !== '#โปรดเรียกผมว่านายท่านปั้น')];
    }

    // Fill up to 6 hashtags if fewer
    for (const tag of fallbackHashtags) {
      if (finalHashtags.length >= 6) break;
      if (!finalHashtags.includes(tag)) {
        finalHashtags.push(tag);
      }
    }

    output.hashtags = finalHashtags.slice(0, 6);
    return output;
  }
}
