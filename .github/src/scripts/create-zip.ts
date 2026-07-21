import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectDir = path.resolve(__dirname, '../../');
const zipPath = path.resolve(projectDir, '../ai-facebook-isan-quote-team.zip');

console.log('Packaging project for GitHub upload...');

// Create ZIP using PowerShell Compress-Archive
const psCommand = `PowerShell -Command "Compress-Archive -Path '${projectDir}\\src', '${projectDir}\\.github', '${projectDir}\\package.json', '${projectDir}\\tsconfig.json', '${projectDir}\\.env.example', '${projectDir}\\README.md' -DestinationPath '${zipPath}' -Force"`;

try {
  execSync(psCommand);
  console.log(`Successfully created ZIP package at: ${zipPath}`);
} catch (err: any) {
  console.error('Failed to create ZIP:', err.message);
}
