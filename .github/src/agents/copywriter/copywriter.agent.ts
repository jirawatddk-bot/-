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

    const systemPrompt = `You are a Facebook Copywriter for an authentic Isan quote page named "เว้าไปสั่นล่ะ".
CRITICAL RULES:
1. Write ULTRA-SHORT, CONCISE Facebook captions (Maximum 2 short sentences total).
2. You MUST return EXACTLY 6 HASHTAGS.
3. The FIRST HASHTAG MUST BE "#เว้าไปสั่นล่ะ" (the page name hashtag).`;

    const userPrompt = `Isan Quote: "${input.quote.quoteIsan}"
Thai Meaning: "${input.quote.thaiMeaning}"
Topic: ${input.dailyTopic}

Return JSON:
{
  "openingHook": "Short opening sentence in Thai/Isan",
  "body": "",
  "cta": "Short CTA sentence",
  "emojis": ["🌾", "❤️"],
  "hashtags": ["#เว้าไปสั่นล่ะ", "#คำคมอีสาน", "#อีสานบ้านเฮา", "#ข้อคิดชีวิต", "#แคปชั่นอีสาน", "#กำลังใจ"]
}`;

    const fallbackHashtags = COMMON_ISAN_HASHTAGS.slice(0, 6);

    const fallback: CopywriterOutput = {
      openingHook: `🌾 กำลังใจมื้อนี้ส่งตรงถึงพี่น้องทุกคนครับ ❤️`,
      body: '',
      cta: '👉 กดไลก์ กดแชร์ ส่งกำลังใจให้กันเด้อครับ ✨',
      emojis: ['🌾', '❤️', '✨'],
      hashtags: fallbackHashtags,
    };

    const output = await LLMService.generateJSON<CopywriterOutput>(systemPrompt, userPrompt, () => fallback);

    // Enforce #เว้าไปสั่นล่ะ as first hashtag and ensure exactly 6 hashtags
    let finalHashtags = output.hashtags || [];
    if (!finalHashtags.includes('#เว้าไปสั่นล่ะ')) {
      finalHashtags.unshift('#เว้าไปสั่นล่ะ');
    } else {
      finalHashtags = ['#เว้าไปสั่นล่ะ', ...finalHashtags.filter(h => h !== '#เว้าไปสั่นล่ะ')];
    }

    // Fill up to 6 hashtags if fewer
    for (const tag of COMMON_ISAN_HASHTAGS) {
      if (finalHashtags.length >= 6) break;
      if (!finalHashtags.includes(tag)) {
        finalHashtags.push(tag);
      }
    }

    output.hashtags = finalHashtags.slice(0, 6);
    return output;
  }
}
