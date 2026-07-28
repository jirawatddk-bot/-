import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export interface QuoteCardOptions {
  quoteIsan: string;
  pageName?: string;
}

export class CardGeneratorService {
  private static TEMPLATE_IMAGE_PATH = path.join(__dirname, '../assets/template_bg.jpg');

  /**
   * Generates a high-resolution 1080x1080 Facebook Quote Card PNG Buffer
   * using the user's exact golden sunset background template + centered bold Isan quote text + watermark.
   */
  public static async generateQuoteCard(options: QuoteCardOptions): Promise<Buffer> {
    const width = 1080;
    const height = 1080;
    const pageName = options.pageName || 'เพจ เว้าไปสั่นล่ะ';

    // Word wrap quote into lines of ~18-22 characters
    const lines = this.wrapText(options.quoteIsan, 20);

    // Calculate vertical centering
    const fontSize = lines.length > 3 ? 50 : 60;
    const lineHeight = fontSize * 1.5;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2 + fontSize * 0.8;

    // Font family with comprehensive Linux + Windows + Mac Thai fallbacks
    const fontFamily = "'Prompt', 'Kanit', 'Noto Sans Thai', 'Garuda', 'Kinnari', 'Loma', 'Sarabun', 'Leelawadee UI', sans-serif";

    // Create crisp white text with subtle dark shadow overlay for 100% legibility over sunset
    const textElements = lines
      .map((line, idx) => {
        const y = startY + idx * lineHeight;
        return `
          <!-- Dark Shadow Stroke for visibility -->
          <text x="540" y="${y}" text-anchor="middle" font-family="${fontFamily}" font-weight="700" font-size="${fontSize}px" fill="#000000" opacity="0.8" filter="url(#glow)">${this.escapeXml(line)}</text>
          <!-- Crisp White Main Text -->
          <text x="540" y="${y}" text-anchor="middle" font-family="${fontFamily}" font-weight="700" font-size="${fontSize}px" fill="#ffffff">${this.escapeXml(line)}</text>
        `;
      })
      .join('\n');

    const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Soft Outer Glow/Shadow Filter -->
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.9"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Center Quote Text Block -->
      <g>
        ${textElements}
      </g>

      <!-- Bottom Page Watermark -->
      <text x="540" y="990" text-anchor="middle" font-family="${fontFamily}" font-weight="400" font-size="28px" fill="#ffffff" opacity="0.9" letter-spacing="1.5">${this.escapeXml(pageName)}</text>
    </svg>
    `;

    const svgBuffer = Buffer.from(svgOverlay);

    // Process user template background image
    if (fs.existsSync(this.TEMPLATE_IMAGE_PATH)) {
      const templateBuffer = fs.readFileSync(this.TEMPLATE_IMAGE_PATH);
      
      const resizedBackground = await sharp(templateBuffer)
        .resize(width, height, { fit: 'cover', position: 'center' })
        .toBuffer();

      return await sharp(resizedBackground)
        .composite([{ input: svgBuffer, blend: 'over' }])
        .png()
        .toBuffer();
    } else {
      console.warn('Template background image not found at:', this.TEMPLATE_IMAGE_PATH);
      return await sharp(svgBuffer).png().toBuffer();
    }
  }

  private static wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length > maxChars && currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines.length > 0 ? lines : [text];
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
