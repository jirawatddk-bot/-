import { BaseAgent } from '../base.agent';
import { QuoteWriterOutput, ImagePromptOutput } from '../../types';
import { LLMService } from '../../services/llm.service';

export interface ImagePromptInput {
  quote: QuoteWriterOutput;
  imageTheme: string;
}

export class ImagePromptCreatorAgent extends BaseAgent<ImagePromptInput, ImagePromptOutput> {
  constructor() {
    super('Image Prompt Creator', 'Visual Concept Creator');
  }

  public async execute(input: ImagePromptInput): Promise<ImagePromptOutput> {
    this.logInfo('Creating Visual Image Prompt', { theme: input.imageTheme });

    const systemPrompt = `You are a World-Class AI Art Prompt Engineer.
Create a highly detailed visual prompt for Midjourney/Flux/Imagen depicting authentic Northeastern Thai (Isan) rural culture and landscape.
Themes include: Golden hour rice fields, traditional wooden stilt house (เรือนไทยอีสาน), lotus pond, water buffalo, kratip sticky rice basket, loom weaving, morning mist over village, warm sunrise/sunset.
Style: Cinematic photo, ultra-realistic, warm tone, soft volumetric lighting, 85mm portrait lens, depth of field, 8k resolution.`;

    const userPrompt = `Isan Quote Mood: ${input.quote.emotion}
Visual Theme: ${input.imageTheme}
Keywords: ${input.quote.keywords.join(', ')}

Return JSON:
{
  "prompt": "Detailed English prompt string for AI image generation...",
  "theme": "Isan Village Golden Hour",
  "style": "Ultra Realistic Cinematic Photography",
  "cameraSpec": "Sony A7IV, 85mm f/1.4 lens, shallow depth of field",
  "lighting": "Golden hour sun rays, warm volumetric lighting, soft shadows",
  "mood": "Peaceful, nostalgic, heartwarming",
  "negativePrompt": "blurry, low quality, distorted hands, modern urban buildings, neon signs, text, watermark"
}`;

    const fallback: ImagePromptOutput = {
      prompt: `Cinematic photo of a peaceful Northeastern Thai (Isan) rural village at sunset, golden rice fields reflecting warm orange sun rays, wooden stilt house in background, serene countryside atmosphere, photorealistic, 8k resolution, highly detailed, shot on 85mm f/1.4 lens.`,
      theme: `Isan Countryside Sunset & Rice Field`,
      style: `Ultra Realistic Cinematic Photography`,
      cameraSpec: `Sony A7IV, 85mm f/1.4 lens`,
      lighting: `Golden hour sunset, warm volumetric light rays`,
      mood: `Nostalgic, peaceful, inspiring`,
      negativePrompt: `blurry, low resolution, ugly, distorted, modern electronics, text, logo, watermark, overcrowded`,
    };

    return await LLMService.generateJSON<ImagePromptOutput>(systemPrompt, userPrompt, () => fallback);
  }
}
