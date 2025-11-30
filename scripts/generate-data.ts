import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import chardet from 'chardet';
import iconv from 'iconv-lite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 多语言描述类型
interface LocalizedDescription {
  'zh-CN'?: string;
  'en'?: string;
}

interface SoftwareVersion {
  version: string;
  description?: string;
  descriptions?: LocalizedDescription;
  downloadType: 'direct' | 'p2p' | 'official';
  files?: string[];
  p2pLink?: string;
  officialLink?: string;
}

interface Software {
  name: string;
  description?: string;
  descriptions?: LocalizedDescription;
  tags?: string[];
  versions: SoftwareVersion[];
}

interface SoftwareData {
  software: Software[];
  generatedAt: string;
}

const DOWN_DIR = path.resolve(__dirname, '../down');
const OUTPUT_DIR = path.resolve(__dirname, '../public/data');

// Common Chinese encodings to try when auto-detection fails
const CHINESE_ENCODINGS = ['GBK', 'GB18030', 'GB2312', 'Big5'];

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
 * Read file with automatic encoding detection and optional conversion to UTF-8
 * Supports UTF-8, GBK, GB2312, GB18030, Big5, and other common encodings
 * 
 * @param filePath - Path to the file to read
 * @param convertToUtf8 - If true, converts the file to UTF-8 in place when non-UTF-8 encoding is detected
 * @returns The file content as a string
 */
function readFileWithEncoding(filePath: string, convertToUtf8: boolean = false): string {
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
          // Convert to UTF-8 if requested
          if (convertToUtf8) {
            convertFileToUtf8(filePath, decoded);
          }
          return decoded;
        }
      }
    } catch {
      // Fall through to try other encodings
    }
  }
  
  // Try common Chinese encodings in order of likelihood
  for (const encoding of CHINESE_ENCODINGS) {
    try {
      if (iconv.encodingExists(encoding)) {
        const decoded = iconv.decode(buffer, encoding);
        // Check if decoded content looks valid (contains Chinese characters and no replacement chars)
        if (!decoded.includes('\uFFFD') && /[\u4e00-\u9fff]/.test(decoded)) {
          console.log(`  Fallback encoding: ${encoding} for ${path.basename(filePath)}`);
          // Convert to UTF-8 if requested
          if (convertToUtf8) {
            convertFileToUtf8(filePath, decoded);
          }
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
  
  // Extract ASCII content efficiently by filtering buffer
  const asciiBytes = buffer.filter(byte => byte < 0x80);
  return Buffer.from(asciiBytes).toString('ascii');
}

/**
 * Convert a file to UTF-8 encoding in place
 * This helps normalize all text files to UTF-8 for consistent handling
 */
function convertFileToUtf8(filePath: string, content: string): void {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ Converted to UTF-8: ${path.basename(filePath)}`);
  } catch (error) {
    console.warn(`  Warning: Failed to convert ${path.basename(filePath)} to UTF-8:`, error);
  }
}

function readReadme(dirPath: string, convertToUtf8: boolean = false): string | undefined {
  const readmePath = path.join(dirPath, 'readme.md');
  if (fs.existsSync(readmePath)) {
    return readFileWithEncoding(readmePath, convertToUtf8);
  }
  return undefined;
}

/**
 * Read multilingual readme files from a directory
 * Supports: readme.md (Chinese default), readme.zh-CN.md (Chinese), readme.en.md (English)
 */
function readLocalizedReadme(dirPath: string, convertToUtf8: boolean = false): LocalizedDescription | undefined {
  const descriptions: LocalizedDescription = {};
  
  // Read Chinese readme (priority: readme.zh-CN.md > readme.md)
  const zhCNPath = path.join(dirPath, 'readme.zh-CN.md');
  const defaultPath = path.join(dirPath, 'readme.md');
  
  if (fs.existsSync(zhCNPath)) {
    descriptions['zh-CN'] = readFileWithEncoding(zhCNPath, convertToUtf8);
  } else if (fs.existsSync(defaultPath)) {
    descriptions['zh-CN'] = readFileWithEncoding(defaultPath, convertToUtf8);
  }
  
  // Read English readme
  const enPath = path.join(dirPath, 'readme.en.md');
  if (fs.existsSync(enPath)) {
    descriptions['en'] = readFileWithEncoding(enPath, convertToUtf8);
  }
  
  // Return undefined if no descriptions found
  if (!descriptions['zh-CN'] && !descriptions['en']) {
    return undefined;
  }
  
  return descriptions;
}

function readTags(dirPath: string, convertToUtf8: boolean = false): string[] | undefined {
  const tagsPath = path.join(dirPath, 'tags.txt');
  if (fs.existsSync(tagsPath)) {
    const content = readFileWithEncoding(tagsPath, convertToUtf8).trim();
    if (content) {
      return content.split('\n').map(tag => tag.trim()).filter(tag => tag);
    }
  }
  return undefined;
}

function scanSoftwareDirectory(): SoftwareData {
  const software: Software[] = [];
  // Enable auto-conversion of non-UTF-8 files to UTF-8 during build
  const convertToUtf8 = true;

  if (!fs.existsSync(DOWN_DIR)) {
    console.log('down/ 目录不存在，创建空数据');
    return { software: [], generatedAt: new Date().toISOString() };
  }

  const softwareDirs = fs.readdirSync(DOWN_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const softwareName of softwareDirs) {
    const softwarePath = path.join(DOWN_DIR, softwareName);
    // Read both legacy single description and new multilingual descriptions
    const softwareDescription = readReadme(softwarePath, convertToUtf8);
    const softwareDescriptions = readLocalizedReadme(softwarePath, convertToUtf8);
    
    const versionDirs = fs.readdirSync(softwarePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true })); // 版本号降序

    const versions: SoftwareVersion[] = [];

    // Check for official.txt at software level (for software with no version subdirectories)
    const softwareOfficialFile = path.join(softwarePath, 'official.txt');
    if (versionDirs.length === 0 && fs.existsSync(softwareOfficialFile)) {
      // Software-level official download (no version subdirectory needed)
      const officialLink = fs.readFileSync(softwareOfficialFile, 'utf-8').trim();
      versions.push({
        version: 'latest',
        description: softwareDescription,
        descriptions: softwareDescriptions,
        downloadType: 'official',
        officialLink,
      });
    }

    for (const versionName of versionDirs) {
      const versionPath = path.join(softwarePath, versionName);
      const linkFile = path.join(versionPath, 'link.txt');
      const officialFile = path.join(versionPath, 'official.txt');
      
      // Read version-level multilingual descriptions
      const versionLocalizedDesc = readLocalizedReadme(versionPath, convertToUtf8);
      
      // Merge version descriptions with software descriptions (version takes priority)
      let versionDescriptions: LocalizedDescription | undefined;
      if (versionLocalizedDesc || softwareDescriptions) {
        const zhCN = versionLocalizedDesc?.['zh-CN'] || softwareDescriptions?.['zh-CN'];
        const en = versionLocalizedDesc?.['en'] || softwareDescriptions?.['en'];
        // Only create the object if at least one language has content
        if (zhCN || en) {
          versionDescriptions = {};
          if (zhCN) versionDescriptions['zh-CN'] = zhCN;
          if (en) versionDescriptions['en'] = en;
        }
      }
      
      // Legacy: single description for backward compatibility
      const versionDescription = readReadme(versionPath, convertToUtf8) || softwareDescription;

      if (fs.existsSync(officialFile)) {
        // 官网下载
        const officialLink = fs.readFileSync(officialFile, 'utf-8').trim();
        versions.push({
          version: versionName,
          description: versionDescription,
          descriptions: versionDescriptions,
          downloadType: 'official',
          officialLink,
        });
      } else if (fs.existsSync(linkFile)) {
        // P2P 下载
        const p2pLink = fs.readFileSync(linkFile, 'utf-8').trim();
        versions.push({
          version: versionName,
          description: versionDescription,
          descriptions: versionDescriptions,
          downloadType: 'p2p',
          p2pLink,
        });
      } else {
        // 直接下载
        const files = fs.readdirSync(versionPath)
          .filter(file => {
            const filePath = path.join(versionPath, file);
            // Exclude readme files in any language (case-insensitive check)
            const lowerFile = file.toLowerCase();
            const isReadme = lowerFile === 'readme.md' || 
              lowerFile === 'readme.zh-cn.md' || 
              lowerFile === 'readme.en.md';
            return fs.statSync(filePath).isFile() && !isReadme;
          });

        versions.push({
          version: versionName,
          description: versionDescription,
          descriptions: versionDescriptions,
          downloadType: 'direct',
          files,
        });
      }
    }

    if (versions.length > 0) {
      const tags = readTags(softwarePath, convertToUtf8);
      software.push({
        name: softwareName,
        description: softwareDescription,
        descriptions: softwareDescriptions,
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
  console.log('注意：非 UTF-8 编码的文件将自动转换为 UTF-8');
  
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
