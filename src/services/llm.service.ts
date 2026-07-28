import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env';
import { LoggerService } from './logger.service';

import OpenAI from 'openai';

export class LLMService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static openai: OpenAI | null = null;

  private static getGemini(): GoogleGenerativeAI | null {
    if (!this.genAI && ENV.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    }
    return this.genAI;
  }

  private static getOpenAI(): OpenAI | null {
    if (!this.openai && ENV.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
    }
    return this.openai;
  }

  public static async generateJSON<T>(systemPrompt: string, userPrompt: string, fallbackGenerator: () => T): Promise<T> {
    const provider = ENV.LLM_PROVIDER.toLowerCase();

    // 1. OpenAI ChatGPT Integration
    if (provider === 'openai' && ENV.OPENAI_API_KEY) {
      try {
        const openai = this.getOpenAI();
        if (openai) {
          LoggerService.info('LLMService', 'Generating JSON content using ChatGPT (gpt-4o-mini)');
          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: `${systemPrompt}\n\nIMPORTANT: Return pure valid JSON only without markdown formatting.` },
              { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          });

          const text = response.choices[0]?.message?.content || '';
          const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleanJson) as T;
        }
      } catch (error: any) {
        LoggerService.warn('LLMService', 'ChatGPT API call failed, falling back', { error: error.message });
      }
    }

    // 2. Gemini Integration (Primary)
    const gemini = this.getGemini();
    if (gemini && (provider === 'gemini' || !ENV.OPENAI_API_KEY)) {
      try {
        const model = gemini.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const fullPrompt = `${systemPrompt}\n\nUser Context:\n${userPrompt}\n\nIMPORTANT: Return pure valid JSON only without markdown formatting.`;
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();

        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as T;
      } catch (error: any) {
        LoggerService.warn('LLMService', 'Gemini API Call failed', { error: error.message });
      }
    }

    // 3. Fallback Mode
    LoggerService.info('LLMService', 'Using Structured Fallback Generator Mode');
    return fallbackGenerator();
  }
}
