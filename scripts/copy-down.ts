import { cpSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const source = join(__dirname, '..', 'down');
const destination = join(__dirname, '..', 'dist', 'down');

try {
  cpSync(source, destination, { recursive: true });
  console.log('✓ Copied down folder to dist/');
} catch (error) {
  console.error('Failed to copy down folder:', error);
  process.exit(1);
}
