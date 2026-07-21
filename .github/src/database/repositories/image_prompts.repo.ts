import { getDatabase } from '../db';
import { ImagePromptEntity } from '../../types';

export class ImagePromptsRepository {
  public static insert(promptData: ImagePromptEntity): number {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO image_prompts (prompt, theme, style, camera_spec, lighting, mood, negative_prompt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      promptData.prompt,
      promptData.theme,
      promptData.style,
      promptData.camera_spec,
      promptData.lighting,
      promptData.mood,
      promptData.negative_prompt
    );
    return info.lastInsertRowid as number;
  }

  public static findById(id: number): ImagePromptEntity | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM image_prompts WHERE id = ?').get(id) as ImagePromptEntity | undefined;
  }
}
