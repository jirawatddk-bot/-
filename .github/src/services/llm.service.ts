import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env';
import { LoggerService } from './logger.service';

export class LLMService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getAI(): GoogleGenerativeAI | null {
    if (!this.genAI && ENV.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    }
    return this.genAI;
  }

  public static async generateJSON<T>(systemPrompt: string, userPrompt: string, fallbackGenerator: () => T): Promise<T> {
    const ai = this.getAI();
    
    if (!ai || ENV.LLM_PROVIDER === 'mock') {
      LoggerService.info('LLMService', 'Using Structured Fallback / Mock Mode', { reason: 'No API Key or Mock Provider set' });
      return fallbackGenerator();
    }

    try {
      const model = ai.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const fullPrompt = `${systemPrompt}\n\nUser Context:\n${userPrompt}\n\nIMPORTANT: Return pure valid JSON only without markdown formatting.`;
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();

      // Clean response formatting
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as T;
    } catch (error: any) {
      LoggerService.warn('LLMService', 'LLM Call failed, resorting to fallback generator', { error: error.message });
      return fallbackGenerator();
    }
  }
}
