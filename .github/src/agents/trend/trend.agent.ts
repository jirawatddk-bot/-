import { BaseAgent } from '../base.agent';
import {
  TrendAgentInput,
  TrendReportOutput,
  TrendingTopicItem,
  TrendPriority,
  TrendScoreBreakdown,
  ContentSuggestion
} from '../../types';

export class TrendAgent extends BaseAgent<TrendAgentInput, TrendReportOutput> {
  private readonly unsafeKeywords: string[] = [
    'diagnosis',
    'medical diagnosis',
    'prescribe',
    'medication dosage',
    'shock collar',
    'choke chain',
    'hit your dog',
    'punish puppy physically',
    'guaranteed cure',
    'secret remedy'
  ];

  constructor() {
    super('Agent 8: Pet Trend Analyst', 'Pet Industry Trend Analyst');
  }

  public async execute(input: TrendAgentInput = {}): Promise<TrendReportOutput> {
    this.logInfo('Executing Trend Analysis Workflow', { input });

    const currentDate = input.customDate || new Date().toISOString().split('T')[0];

    // Candidate trend pool covering required pet topics
    const rawTrends = [
      {
        topic: 'Rainy Season Paw Care & Fungal Infection Prevention for Small Dogs',
        category: 'Rainy season care',
        whyTrending: 'Increased rainfall causes damp paws, leading to pododermatitis and yeast infections in small dogs.',
        audienceIntent: 'Seeking quick, effective routine care tips after walks in wet weather.',
        recommendedContentType: 'Infographic + Step-by-Step Care Guide',
        recommendedPostingTime: '18:30',
        breakdown: {
          searchVolume: 92,
          socialEngagement: 95,
          growthRate: 88,
          competition: 65,
          relevanceToAudience: 98,
          seasonalRelevance: 96,
          contentFreshness: 90
        },
        reason: 'High seasonal relevance during monsoon season with high engagement from concerned small dog owners.',
        contentIdea: '5-Step Post-Walk Paw Care Routine to Keep Your Frenchie & Pom Paws Infection-Free',
        targetAudience: 'Small dog owners living in urban and sub-urban areas experiencing rainy weather',
        recommendedImageTheme: 'Cute Pomeranian having its paws gently wiped with a clean towel in a modern warm home setting',
        hashtags: ['#DogCare', '#SmallDogCare', '#RainySeasonPets', '#FrenchBulldog', '#PomeranianCare', '#PetHealthTips']
      },
      {
        topic: 'Heatstroke Awareness & Hydration Hacks for Brachycephalic Breeds',
        category: 'Heat season care',
        whyTrending: 'Rising outdoor temperatures increase heat stress risks, especially for flat-faced breeds like Frenchies and Pugs.',
        audienceIntent: 'Wanting safe cooling methods and signs of heatstroke to watch out for.',
        recommendedContentType: 'Carousel Post with Warning Signs & DIY Ice Treats',
        recommendedPostingTime: '11:30',
        breakdown: {
          searchVolume: 90,
          socialEngagement: 92,
          growthRate: 85,
          competition: 70,
          relevanceToAudience: 96,
          seasonalRelevance: 95,
          contentFreshness: 88
        },
        reason: 'Urgent health awareness topic for short-muzzled small breeds.',
        contentIdea: 'Is Your Frenchie Too Hot? 4 Danger Signs & Refreshing Electrolyte Dog Popsicles Recipe',
        targetAudience: 'French Bulldog, Pug, and Shih Tzu owners',
        recommendedImageTheme: 'Happy French Bulldog resting on a cooling mat with a fresh bowl of water nearby',
        hashtags: ['#FrenchBulldogCare', '#DogHeatstrokePrevent', '#SummerDogTips', '#PetSafety', '#Brachycephalic']
      },
      {
        topic: 'Positive Reinforcement Puppy Teething & Potty Training Hacks',
        category: 'Puppy behavior & Dog training methods',
        whyTrending: 'Surge in new puppy adoptions leads to high search volume for non-destructive teething solutions.',
        audienceIntent: 'Looking for gentle, non-punitive ways to handle puppy biting and housebreaking.',
        recommendedContentType: 'Short Video / Reel Breakdown + Checklist',
        recommendedPostingTime: '20:00',
        breakdown: {
          searchVolume: 94,
          socialEngagement: 89,
          growthRate: 82,
          competition: 78,
          relevanceToAudience: 95,
          seasonalRelevance: 80,
          contentFreshness: 85
        },
        reason: 'Evergreen high-volume topic with strong intent from first-time puppy parents.',
        contentIdea: 'Stop Puppy Teething Bites Gently: 3 Safe Toy Swaps & Positive Rewards',
        targetAudience: 'First-time puppy owners and parents of small breed puppies',
        recommendedImageTheme: 'Playful Poodle puppy chewing a safe soft rubber teething toy on a cozy rug',
        hashtags: ['#PuppyTraining', '#PositiveReinforcement', '#DogTrainingTips', '#PuppyTeething', '#PoodlePuppy']
      },
      {
        topic: 'Dog-Friendly Cafés & Weekend Travel Etiquette with Toy Breeds',
        category: 'Pet lifestyle & Dog-friendly cafés',
        whyTrending: 'Pet-inclusive lifestyle culture is growing rapidly, with owners seeking pet-friendly weekend spots.',
        audienceIntent: 'Discovering safe cafés and learning pet etiquette for public places.',
        recommendedContentType: 'Photo Listicle + Travel Checklist',
        recommendedPostingTime: '10:00',
        breakdown: {
          searchVolume: 85,
          socialEngagement: 91,
          growthRate: 89,
          competition: 60,
          relevanceToAudience: 92,
          seasonalRelevance: 85,
          contentFreshness: 92
        },
        reason: 'High viral engagement and save rates on social media platforms.',
        contentIdea: 'Weekend Outing Guide: 5 Golden Rules for Visiting Dog-Friendly Cafés with Your Chihuahua',
        targetAudience: 'Lifestyle-focused pet parents who love traveling with small dogs',
        recommendedImageTheme: 'Chihuahua sitting politely in a pet carrier bag at an aesthetically pleasing outdoor café table',
        hashtags: ['#DogFriendlyCafe', '#PetTravel', '#ChihuahuaLife', '#PetLifestyle', '#WeekendWithDogs']
      },
      {
        topic: 'Senior Small Dog Joint Health & Gentle Massage Techniques',
        category: 'Senior dog care',
        whyTrending: 'Pet humanization trend leads to increased focus on longevity and comfort for aging small dogs.',
        audienceIntent: 'Seeking non-invasive comfort methods and early signs of joint stiffness.',
        recommendedContentType: 'Educational Video / Illustrated Guide',
        recommendedPostingTime: '19:00',
        breakdown: {
          searchVolume: 78,
          socialEngagement: 86,
          growthRate: 80,
          competition: 55,
          relevanceToAudience: 90,
          seasonalRelevance: 75,
          contentFreshness: 87
        },
        reason: 'Strong emotional connection and high audience trust building.',
        contentIdea: 'Helping Your Senior Shih Tzu Stay Spry: 3 Gentle Daily Joint Massages',
        targetAudience: 'Owners of senior small dogs (7+ years old)',
        recommendedImageTheme: 'Older Shih Tzu enjoying a gentle shoulder stroke while relaxed on a warm cushion',
        hashtags: ['#SeniorDogCare', '#ShihTzuLove', '#DogJointHealth', '#PetWellness', '#LovingSeniorDogs']
      }
    ];

    const processedTopics: TrendingTopicItem[] = [];

    for (const item of rawTrends) {
      // Safety Check
      if (this.containsUnsafeContent(item.topic + ' ' + item.contentIdea)) {
        this.logWarn('Skipping trend due to safety policy violation', { topic: item.topic });
        continue;
      }

      const score = this.calculateTrendScore(item.breakdown);
      const priority = this.determinePriority(score);

      const contentSuggestion: ContentSuggestion = {
        topic: item.topic,
        whyTrending: item.whyTrending,
        audienceIntent: item.audienceIntent,
        recommendedContentType: item.recommendedContentType,
        recommendedPostingTime: item.recommendedPostingTime,
        trendScore: score
      };

      processedTopics.push({
        topic: item.topic,
        trendScore: score,
        priority: priority,
        reason: item.reason,
        contentIdea: item.contentIdea,
        targetAudience: item.targetAudience,
        recommendedImageTheme: item.recommendedImageTheme,
        hashtags: item.hashtags,
        scoreBreakdown: item.breakdown,
        contentSuggestion: contentSuggestion
      });
    }

    // Sort by Trend Score descending
    processedTopics.sort((a, b) => b.trendScore - a.trendScore);

    const report: TrendReportOutput = {
      date: currentDate,
      trendingTopics: processedTopics
    };

    this.logInfo('Trend Analysis Completed Successfully', {
      topicCount: report.trendingTopics.length,
      topTopic: report.trendingTopics[0]?.topic
    });

    return report;
  }

  /**
   * Calculates overall Trend Score (0–100) based on weighted parameters
   */
  public calculateTrendScore(breakdown: TrendScoreBreakdown): number {
    const score =
      breakdown.searchVolume * 0.25 +
      breakdown.socialEngagement * 0.25 +
      breakdown.growthRate * 0.15 +
      breakdown.relevanceToAudience * 0.15 +
      breakdown.seasonalRelevance * 0.10 +
      breakdown.contentFreshness * 0.10;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Assigns Priority tier based on score thresholds
   */
  public determinePriority(score: number): TrendPriority {
    if (score >= 88) return 'High';
    if (score >= 75) return 'Medium';
    return 'Low';
  }

  /**
   * Enforces strict safety guardrails
   */
  private containsUnsafeContent(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.unsafeKeywords.some(keyword => lowerText.includes(keyword));
  }
}
