import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import chardet from 'chardet';
import iconv from 'iconv-lite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SoftwareVersion {
  version: string;
  description?: string;
  downloadType: 'direct' | 'p2p';
  files?: string[];
  p2pLink?: string;
}

interface Software {
  name: string;
  description?: string;
  tags?: string[];
  versions: SoftwareVersion[];
}

interface SoftwareData {
  software: Software[];
  generatedAt: string;
}

const DOWN_DIR = path.resolve(__dirname, '../down');
const OUTPUT_DIR = path.resolve(__dirname, '../public/data');

/**
 * Check if a string is valid UTF-8 (no replacement characters or invalid sequences)
 */
function isValidUtf8(buffer: Buffer): boolean {
  try {
    const str = buffer.toString('utf-8');
    // Check for replacement character which indicates invalid UTF-8 bytes
    return !str.includes('\uFFFD');
  } catch {
    return false;
  }
}

/**
 * Read file with automatic encoding detection
 * Supports UTF-8, GBK, GB2312, GB18030, Big5, and other common encodings
 */
function readFileWithEncoding(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  
  // First, check if file is valid UTF-8
  if (isValidUtf8(buffer)) {
    return buffer.toString('utf-8');
  }
  
  // Detect encoding using chardet
  const detectedEncoding = chardet.detect(buffer);
  
  // Try to decode with detected encoding (if not UTF-8)
  if (detectedEncoding && detectedEncoding !== 'UTF-8' && detectedEncoding !== 'ASCII') {
    try {
      if (iconv.encodingExists(detectedEncoding)) {
        const decoded = iconv.decode(buffer, detectedEncoding);
        // Verify if the decoded content looks valid (contains no replacement characters)
        if (!decoded.includes('\uFFFD')) {
          console.log(`  Detected encoding: ${detectedEncoding} for ${path.basename(filePath)}`);
          return decoded;
        }
      }
    } catch {
      // Fall through to try other encodings
    }
  }
  
  // Try common Chinese encodings in order of likelihood
  const encodingsToTry = ['GBK', 'GB18030', 'GB2312', 'Big5'];
  
  for (const encoding of encodingsToTry) {
    try {
      if (iconv.encodingExists(encoding)) {
        const decoded = iconv.decode(buffer, encoding);
        // Check if decoded content looks valid (contains Chinese characters and no replacement chars)
        if (!decoded.includes('\uFFFD') && /[\u4e00-\u9fff]/.test(decoded)) {
          console.log(`  Fallback encoding: ${encoding} for ${path.basename(filePath)}`);
          return decoded;
        }
      }
    } catch {
      continue;
    }
  }
  
  // Last resort: return as UTF-8 with invalid bytes replaced
  // This provides readable ASCII content while marking corrupted bytes
  console.warn(`  Warning: Could not detect valid encoding for ${path.basename(filePath)}, using UTF-8 with replacement`);
  
  // Use a custom replacement that removes invalid byte sequences
  // while keeping the ASCII parts readable
  let result = '';
  let i = 0;
  while (i < buffer.length) {
    const byte = buffer[i];
    if (byte < 0x80) {
      // ASCII character
      result += String.fromCharCode(byte);
      i++;
    } else {
      // Non-ASCII byte - skip it (remove garbled characters)
      i++;
    }
  }
  
  return result;
}

function readReadme(dirPath: string): string | undefined {
  const readmePath = path.join(dirPath, 'readme.md');
  if (fs.existsSync(readmePath)) {
    return readFileWithEncoding(readmePath);
  }
  return undefined;
}

function readTags(dirPath: string): string[] | undefined {
  const tagsPath = path.join(dirPath, 'tags.txt');
  if (fs.existsSync(tagsPath)) {
    const content = readFileWithEncoding(tagsPath).trim();
    if (content) {
      return content.split('\n').map(tag => tag.trim()).filter(tag => tag);
    }
  }
  return undefined;
}

function scanSoftwareDirectory(): SoftwareData {
  const software: Software[] = [];

  if (!fs.existsSync(DOWN_DIR)) {
    console.log('down/ 目录不存在，创建空数据');
    return { software: [], generatedAt: new Date().toISOString() };
  }

  const softwareDirs = fs.readdirSync(DOWN_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const softwareName of softwareDirs) {
    const softwarePath = path.join(DOWN_DIR, softwareName);
    const softwareDescription = readReadme(softwarePath);
    
    const versionDirs = fs.readdirSync(softwarePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true })); // 版本号降序

    const versions: SoftwareVersion[] = [];

    for (const versionName of versionDirs) {
      const versionPath = path.join(softwarePath, versionName);
      const linkFile = path.join(versionPath, 'link.txt');
      
      // 优先使用版本目录的 readme.md，否则使用软件目录的
      const versionDescription = readReadme(versionPath) || softwareDescription;

      if (fs.existsSync(linkFile)) {
        // P2P 下载
        const p2pLink = fs.readFileSync(linkFile, 'utf-8').trim();
        versions.push({
          version: versionName,
          description: versionDescription,
          downloadType: 'p2p',
          p2pLink,
        });
      } else {
        // 直接下载
        const files = fs.readdirSync(versionPath)
          .filter(file => {
            const filePath = path.join(versionPath, file);
            return fs.statSync(filePath).isFile() && file.toLowerCase() !== 'readme.md';
          });

        versions.push({
          version: versionName,
          description: versionDescription,
          downloadType: 'direct',
          files,
        });
      }
    }

    if (versions.length > 0) {
      const tags = readTags(softwarePath);
      software.push({
        name: softwareName,
        description: softwareDescription,
        tags,
        versions,
      });
    }
  }

  return {
    software,
    generatedAt: new Date().toISOString(),
  };
}

function main() {
  console.log('开始生成软件数据...');
  
  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const data = scanSoftwareDirectory();
  const outputPath = path.join(OUTPUT_DIR, 'software.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log(`生成完成！共 ${data.software.length} 个软件`);
  console.log(`输出文件: ${outputPath}`);
}

main();
