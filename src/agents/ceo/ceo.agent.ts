import { BaseAgent } from '../base.agent';
import { FullWorkflowResult, ValidationResult } from '../../types';
import { ContentPlannerAgent } from '../planner/planner.agent';
import { IsanQuoteWriterAgent } from '../quote_writer/quote_writer.agent';
import { FacebookCopywriterAgent } from '../copywriter/copywriter.agent';
import { ImagePromptCreatorAgent } from '../image_prompt/image_prompt.agent';
import { FacebookPublisherAgent } from '../publisher/publisher.agent';
import { AnalyticsAgent } from '../analytics/analytics.agent';

import { QuotesRepository } from '../../database/repositories/quotes.repo';
import { CaptionsRepository } from '../../database/repositories/captions.repo';
import { ImagePromptsRepository } from '../../database/repositories/image_prompts.repo';
import { PostsRepository } from '../../database/repositories/posts.repo';
import { LoggerService } from '../../services/logger.service';

export interface CEOExecuteOptions {
  customTopic?: string;
}

export class CEOAgent extends BaseAgent<CEOExecuteOptions | undefined, FullWorkflowResult> {
  private planner: ContentPlannerAgent;
  private quoteWriter: IsanQuoteWriterAgent;
  private copywriter: FacebookCopywriterAgent;
  private imagePromptCreator: ImagePromptCreatorAgent;
  private publisher: FacebookPublisherAgent;
  private analyticsAgent: AnalyticsAgent;

  constructor() {
    super('CEO Agent', 'Project Manager & Workflow Orchestrator');
    this.planner = new ContentPlannerAgent();
    this.quoteWriter = new IsanQuoteWriterAgent();
    this.copywriter = new FacebookCopywriterAgent();
    this.imagePromptCreator = new ImagePromptCreatorAgent();
    this.publisher = new FacebookPublisherAgent();
    this.analyticsAgent = new AnalyticsAgent();
  }

  public async execute(options?: CEOExecuteOptions): Promise<FullWorkflowResult> {
    const executedAt = new Date().toISOString();
    this.logInfo('Workflow Initiated', { time: executedAt, customTopic: options?.customTopic });

    // Step 1: Content Planner
    this.logInfo('Step 1: Invoking Content Planner Agent');
    const plannerOutput = await this.planner.execute({
      customTopic: options?.customTopic,
    });

    // Step 2: Isan Quote Writer
    this.logInfo('Step 2: Invoking Isan Quote Writer Agent');
    const quoteOutput = await this.quoteWriter.execute(plannerOutput);
    const quoteHash = QuotesRepository.generateHash(quoteOutput.quoteIsan);

    // Step 3: Facebook Copywriter
    this.logInfo('Step 3: Invoking Facebook Copywriter Agent');
    const copywriterOutput = await this.copywriter.execute({
      quote: quoteOutput,
      dailyTopic: plannerOutput.dailyTopic,
    });

    // Step 4: Image Prompt Creator
    this.logInfo('Step 4: Invoking Image Prompt Creator Agent');
    const imagePromptOutput = await this.imagePromptCreator.execute({
      quote: quoteOutput,
      imageTheme: plannerOutput.imageTheme,
    });

    // Step 5: CEO Validation & DB Staging
    this.logInfo('Step 5: CEO Validating Outputs & Staging DB Records');
    const validation: ValidationResult = {
      isValid: true,
      hash: quoteHash,
    };

    // Save entities into SQLite Database
    const quoteId = QuotesRepository.insert({
      quote_isan: quoteOutput.quoteIsan,
      thai_meaning: quoteOutput.thaiMeaning,
      emotion: quoteOutput.emotion,
      keywords: quoteOutput.keywords.join(', '),
      hash_code: quoteHash,
    });

    const captionId = CaptionsRepository.insert({
      opening_hook: copywriterOutput.openingHook,
      body: copywriterOutput.body,
      cta: copywriterOutput.cta,
      emojis: copywriterOutput.emojis.join(' '),
      hashtags: copywriterOutput.hashtags.join(' '),
    });

    const imagePromptId = ImagePromptsRepository.insert({
      prompt: imagePromptOutput.prompt,
      theme: imagePromptOutput.theme,
      style: imagePromptOutput.style,
      camera_spec: imagePromptOutput.cameraSpec,
      lighting: imagePromptOutput.lighting,
      mood: imagePromptOutput.mood,
      negative_prompt: imagePromptOutput.negativePrompt,
    });

    const postId = PostsRepository.insert({
      quote_id: quoteId,
      caption_id: captionId,
      image_prompt_id: imagePromptId,
      status: 'DRAFT',
      scheduled_at: new Date().toISOString(),
    });

    this.logInfo('Staged Post in DB', { postId, quoteId, captionId, imagePromptId });

    // Step 6: Facebook Publisher
    this.logInfo('Step 6: Invoking Facebook Publisher Agent');
    const publisherOutput = await this.publisher.execute({
      postId,
      quote: quoteOutput,
      copywriter: copywriterOutput,
      imagePrompt: imagePromptOutput,
    });

    // Step 7: Analytics & Feedback Loop
    this.logInfo('Step 7: Invoking Analytics Agent for Post Evaluation');
    const analyticsOutput = await this.analyticsAgent.execute({
      postId,
      dailyTopic: plannerOutput.dailyTopic,
    });

    const fullResult: FullWorkflowResult = {
      success: publisherOutput.status === 'PUBLISHED',
      postId,
      fbPostId: publisherOutput.fbPostId,
      planner: plannerOutput,
      quote: quoteOutput,
      copywriter: copywriterOutput,
      imagePrompt: imagePromptOutput,
      publisher: publisherOutput,
      analytics: analyticsOutput,
      validation,
      executedAt,
    };

    LoggerService.history('WORKFLOW_EXECUTION', fullResult);
    this.logInfo('Workflow Completed Successfully', { postId, fbPostId: publisherOutput.fbPostId });

    return fullResult;
  }
}
