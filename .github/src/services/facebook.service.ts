import { ENV } from '../config/env';
import { LoggerService } from './logger.service';

export interface FBPublishOptions {
  message: string;
  imageUrl?: string;
  imageBuffer?: Buffer;
}

export class FacebookService {
  public static async publishPost(options: FBPublishOptions, maxRetries: number = 3): Promise<{ success: boolean; fbPostId: string; dryRun: boolean }> {
    if (ENV.FACEBOOK_DRY_RUN || !ENV.FACEBOOK_PAGE_ID || !ENV.FACEBOOK_PAGE_ACCESS_TOKEN) {
      LoggerService.info('FacebookService', 'Dry-Run Posting Mode (No actual FB post created)', {
        messageSnippet: options.message.slice(0, 80),
        dryRun: true,
      });

      const mockFbPostId = `fb_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      return {
        success: true,
        fbPostId: mockFbPostId,
        dryRun: true,
      };
    }

    let attempt = 0;
    let lastError = '';

    while (attempt < maxRetries) {
      attempt++;
      try {
        LoggerService.info('FacebookService', `Attempting to publish to Facebook (Attempt ${attempt}/${maxRetries})`);
        
        let url: string;
        let response: Response;

        if (options.imageBuffer) {
          // Upload Image Buffer directly via multipart/form-data
          url = `https://graph.facebook.com/v19.0/${ENV.FACEBOOK_PAGE_ID}/photos`;
          const formData = new FormData();
          const blob = new Blob([new Uint8Array(options.imageBuffer)], { type: 'image/png' });
          
          formData.append('source', blob, 'quote_card.png');
          formData.append('caption', options.message);
          formData.append('access_token', ENV.FACEBOOK_PAGE_ACCESS_TOKEN);

          response = await fetch(url, {
            method: 'POST',
            body: formData,
          });
        } else if (options.imageUrl) {
          // Upload by Image URL
          url = `https://graph.facebook.com/v19.0/${ENV.FACEBOOK_PAGE_ID}/photos`;
          const params = new URLSearchParams({
            url: options.imageUrl,
            caption: options.message,
            access_token: ENV.FACEBOOK_PAGE_ACCESS_TOKEN,
          });

          response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          });
        } else {
          // Text Post
          url = `https://graph.facebook.com/v19.0/${ENV.FACEBOOK_PAGE_ID}/feed`;
          const params = new URLSearchParams({
            message: options.message,
            access_token: ENV.FACEBOOK_PAGE_ACCESS_TOKEN,
          });

          response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          });
        }

        const data = await response.json() as any;

        if (!response.ok || data.error) {
          throw new Error(data.error?.message || `HTTP ${response.status}: Failed to publish to FB`);
        }

        const fbPostId = data.id || data.post_id || `fb_${Date.now()}`;
        LoggerService.info('FacebookService', 'Successfully published Photo Quote Card to Facebook Page', { fbPostId });

        return {
          success: true,
          fbPostId,
          dryRun: false,
        };
      } catch (err: any) {
        lastError = err.message;
        LoggerService.warn('FacebookService', `Publish attempt ${attempt} failed: ${lastError}`);
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Facebook publishing failed after ${maxRetries} attempts. Last error: ${lastError}`);
  }
}
