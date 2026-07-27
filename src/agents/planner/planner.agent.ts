import { BaseAgent } from '../base.agent';
import { PlannerOutput } from '../../types';
import { DAY_STRATEGIES } from '../../config/constants';
import { LLMService } from '../../services/llm.service';
import { TopicScheduleService } from '../../services/topic_schedule.service';

export interface PlannerInput {
  targetDate?: Date;
  customTopic?: string;
  analyticsFeedback?: string;
}

export class ContentPlannerAgent extends BaseAgent<PlannerInput, PlannerOutput> {
  constructor() {
    super('Content Planner', 'Content Strategist');
  }

  public async execute(input: PlannerInput = {}): Promise<PlannerOutput> {
    const date = input.targetDate || new Date();
    const dayOfWeek = date.getDay();
    const dayStrategy = DAY_STRATEGIES[dayOfWeek] || DAY_STRATEGIES[1];

    // Priority: Instant input > Scheduled Day Topic > Default Day Strategy
    const scheduledTopic = TopicScheduleService.getTopicForDay(dayOfWeek);
    const activeTopic = input.customTopic || scheduledTopic || dayStrategy.topic;

    this.logInfo('Planning Strategy', {
      dayName: dayStrategy.dayName,
      topic: activeTopic,
      isCustomTopic: !!input.customTopic,
      scheduledTopic,
    });

    const systemPrompt = `You are an expert Content Strategist for an authentic Isan (Northeastern Thai) Facebook Page.
Your goal is to devise a daily post plan that engages Isan readers, migrant workers, and lovers of Isan culture.`;

    const userPrompt = `Date: ${date.toISOString().split('T')[0]} (${dayStrategy.dayName})
Active Topic: ${activeTopic}
Theme: ${dayStrategy.theme}
Target Emotion: ${dayStrategy.emotion}
Analytics Feedback from Previous Posts: ${input.analyticsFeedback || 'Engagement is healthy.'}

Return JSON with:
{
  "dailyTopic": "${this.escapeJson(activeTopic)}",
  "weeklyTheme": "weekly theme in Thai",
  "monthlyTheme": "monthly theme in Thai",
  "postingSchedule": "08:00 AM / 18:30 PM",
  "audienceEmotion": "target audience emotion",
  "targetAudience": "target audience description",
  "imageTheme": "visual aesthetic theme"
}`;

    const fallback: PlannerOutput = {
      dailyTopic: activeTopic,
      weeklyTheme: `สัปดาห์แห่ง${dayStrategy.theme}`,
      monthlyTheme: 'เดือนแห่งสัจธรรมชีวิตและการต่อสู้ของคนอีสาน',
      postingSchedule: '18:30 น. (ช่วงเวลาเลิกงานคนอีสาน)',
      audienceEmotion: dayStrategy.emotion,
      targetAudience: dayStrategy.targetAudience,
      imageTheme: `ฉากบรรยากาศ${dayStrategy.theme} แสงอบอุ่น ทุ่งนาบ้านนา`,
    };

    return await LLMService.generateJSON<PlannerOutput>(systemPrompt, userPrompt, () => fallback);
  }

  private escapeJson(str: string): string {
    return str.replace(/"/g, '\\"');
  }
}
