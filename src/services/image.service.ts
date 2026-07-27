import { ImagePromptOutput } from '../types';

export class ImageService {
  /**
   * Generates a stunning, ultra-high-quality AI image URL using the Flux model via Pollinations AI.
   * Model set to 'flux' for photorealistic lighting, sharp detail, and artistic aesthetics.
   */
  public static generatePlaceholderImageUrl(promptData: ImagePromptOutput): string {
    // Clean prompt for maximum aesthetic rendering with Flux model
    const aestheticPrompt = `Breathtaking cinematic portrait photography of Northeastern Thai Isan rural countryside, golden hour sun rays, lush green rice fields, traditional wooden stilt house in distance, peaceful atmosphere, warm color grading, award winning photography, 8k resolution, photorealistic, highly detailed`;
    
    const encodedPrompt = encodeURIComponent(aestheticPrompt);
    const seed = Math.floor(Math.random() * 1000000);
    
    // Using Flux engine for stunning ultra-realistic visuals
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&seed=${seed}&model=flux&nologo=true`;
  }
}
