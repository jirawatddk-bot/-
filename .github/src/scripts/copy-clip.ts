import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const yamlPath = path.resolve(__dirname, '../../.github/workflows/auto-post.yml');
const content = fs.readFileSync(yamlPath, 'utf-8');

try {
  execSync('clip', { input: content });
  console.log('✅ YAML workflow copied to Windows Clipboard successfully!');
} catch (err: any) {
  console.error('Failed to copy:', err.message);
}
