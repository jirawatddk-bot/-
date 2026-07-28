import { BaseAgent } from '../base.agent';
import { PublisherOutput, CopywriterOutput, QuoteWriterOutput, ImagePromptOutput } from '../../types';
import { FacebookService } from '../../services/facebook.service';
import { PostsRepository } from '../../database/repositories/posts.repo';
import { CardGeneratorService } from '../../services/card_generator.service';

export interface PublisherInput {
  postId: number;
  quote: QuoteWriterOutput;
  copywriter: CopywriterOutput;
  imagePrompt: ImagePromptOutput;
}

export class FacebookPublisherAgent extends BaseAgent<PublisherInput, PublisherOutput> {
  constructor() {
    super('Facebook Publisher', 'Automation & Publishing Engine');
  }

  public async execute(input: PublisherInput): Promise<PublisherOutput> {
    this.logInfo('Executing Facebook Quote Card Generation & Publishing', { postId: input.postId });

    // Format clean, short caption
    const parts = [
      input.copywriter.openingHook,
      input.copywriter.body,
      input.copywriter.cta,
      input.copywriter.hashtags.join(' '),
    ].filter(p => p && p.trim().length > 0);

    const fullCaption = parts.join('\n\n');

    try {
      // Generate Quote Card PNG using the template with exact watermark
      const cardBuffer = await CardGeneratorService.generateQuoteCard({
        quoteIsan: input.quote.quoteIsan,
        pageName: 'เพจ เว้าไปสั่นล่ะ',
      });

      this.logInfo('Quote Card PNG generated successfully', { postId: input.postId, size: cardBuffer.length });

      const publishResult = await FacebookService.publishPost({
        message: fullCaption,
        imageBuffer: cardBuffer,
      });

      PostsRepository.updateStatus(input.postId, 'PUBLISHED', publishResult.fbPostId);

      const output: PublisherOutput = {
        postId: input.postId,
        fbPostId: publishResult.fbPostId,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        dryRun: publishResult.dryRun,
      };

      this.logInfo('Quote Card Published Successfully', output);
      return output;
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown publishing error';
      this.logError('Publishing Failed', { postId: input.postId, error: errorMessage });
      PostsRepository.updateStatus(input.postId, 'FAILED', undefined, errorMessage);

      return {
        postId: input.postId,
        fbPostId: null,
        status: 'FAILED',
        publishedAt: null,
        dryRun: false,
        error: errorMessage,
      };
    }
  }
}
