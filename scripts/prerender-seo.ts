import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types matching the software data structure
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

const DIST_DIR = path.resolve(__dirname, '../dist');
const DATA_FILE = path.join(DIST_DIR, 'data/software.json');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

// Chinese tag translations
const TAG_TRANSLATIONS: Record<string, string> = {
  'system': '系统工具',
  'utility': '实用工具',
  'office': '办公软件',
  'development': '开发工具',
  'media': '媒体工具',
  'network': '网络工具',
  'security': '安全软件',
  'communication': '通讯软件',
  'compression': '压缩工具',
  'virtualization': '虚拟化',
};

/**
 * Strip markdown formatting to get plain text for SEO description
 */
function stripMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  return markdown
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize a string for use as a directory name
 * Replaces characters that are problematic on various filesystems
 */
function sanitizeDirectoryName(name: string): string {
  return name
    // Replace characters that are invalid on Windows/Unix filesystems
    .replace(/[<>:"/\\|?*]/g, '_')
    // Replace control characters (using character class range)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, '')
    // Trim leading/trailing spaces and dots (problematic on Windows)
    .replace(/^[\s.]+|[\s.]+$/g, '')
    // Limit length to avoid filesystem issues
    .substring(0, 255);
}

/**
 * Get localized description, with fallback
 */
function getLocalizedDescription(
  descriptions: LocalizedDescription | undefined,
  legacyDescription: string | undefined,
  language: 'zh-CN' | 'en'
): string | undefined {
  if (descriptions) {
    const fallbackKey = language === 'en' ? 'zh-CN' : 'en';
    return descriptions[language] || descriptions[fallbackKey] || legacyDescription;
  }
  return legacyDescription;
}

/**
 * Generate SEO meta content for a software
 */
function generateSeoMeta(software: Software, language: 'zh-CN' | 'en'): {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  canonicalPath: string;
} {
  const latestVersion = software.versions.length > 0 ? software.versions[0] : undefined;
  const description = getLocalizedDescription(
    software.descriptions || latestVersion?.descriptions,
    software.description || latestVersion?.description,
    language
  );
  const plainDescription = description ? stripMarkdown(description).substring(0, 160) : '';
  const isEnglish = language === 'en';
  
  // Build keywords
  const tagKeywords = software.tags?.map(tag => 
    isEnglish ? tag : (TAG_TRANSLATIONS[tag] || tag)
  ).join(',') || '';
  const versionInfo = latestVersion?.version || '';
  const baseKeywords = isEnglish
    ? `${software.name},${versionInfo},download,software,free download`
    : `${software.name},${versionInfo},下载,软件,免费下载`;
  const keywords = tagKeywords ? `${baseKeywords},${tagKeywords}` : baseKeywords;
  
  // Build title
  const versionText = versionInfo ? ` ${versionInfo}` : '';
  const siteName = isEnglish ? 'Software Download' : '软件下载站';
  const title = isEnglish 
    ? `${software.name}${versionText} - Free Download | ${siteName}`
    : `${software.name}${versionText} 免费下载 - ${siteName}`;
  
  // Build description
  const tagNames = software.tags?.map(tag => 
    isEnglish ? tag : (TAG_TRANSLATIONS[tag] || tag)
  ).join(', ') || '';
  const seoDescription = plainDescription || (isEnglish 
    ? `Download ${software.name}${versionText} for free. ${tagNames ? `Category: ${tagNames}. ` : ''}Safe and fast download.`
    : `免费下载 ${software.name}${versionText}。${tagNames ? `分类：${tagNames}。` : ''}安全快速下载。`);
  
  // Build OG title
  const ogTitle = isEnglish 
    ? `Download ${software.name}${versionText}`
    : `下载 ${software.name}${versionText}`;
  
  // Use path-based URL for canonical (without hash) for better SEO
  return {
    title,
    description: seoDescription,
    keywords,
    ogTitle,
    canonicalPath: `software/${encodeURIComponent(software.name)}`
  };
}

/**
 * Create HTML with updated SEO meta tags for a specific software
 */
function createSoftwareHtml(baseHtml: string, software: Software, language: 'zh-CN' | 'en'): string {
  const seo = generateSeoMeta(software, language);
  
  let html = baseHtml;
  
  // Update title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(seo.title)}</title>`
  );
  
  // Update meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${escapeHtml(seo.description)}"`
  );
  
  // Update meta keywords
  html = html.replace(
    /<meta name="keywords" content="[^"]*"/,
    `<meta name="keywords" content="${escapeHtml(seo.keywords)}"`
  );
  
  // Update OG title
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${escapeHtml(seo.ogTitle)}"`
  );
  
  // Update OG description
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${escapeHtml(seo.description)}"`
  );
  
  // Update Twitter title
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${escapeHtml(seo.ogTitle)}"`
  );
  
  // Update Twitter description
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}"`
  );
  
  return html;
}

/**
 * Main function to pre-render SEO pages
 */
async function main() {
  console.log('开始预渲染 SEO 页面...');
  
  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('错误: dist 目录不存在，请先运行 npm run build');
    process.exit(1);
  }
  
  // Read software data
  if (!fs.existsSync(DATA_FILE)) {
    console.error('错误: 软件数据文件不存在');
    process.exit(1);
  }
  
  const softwareData: SoftwareData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  
  // Read base index.html
  const baseHtml = fs.readFileSync(INDEX_HTML, 'utf-8');
  
  // Create software directory for pre-rendered pages
  const softwareDir = path.join(DIST_DIR, 'software');
  if (!fs.existsSync(softwareDir)) {
    fs.mkdirSync(softwareDir, { recursive: true });
  }
  
  let generatedCount = 0;
  
  // Generate HTML for each software
  for (const software of softwareData.software) {
    // Use Chinese as the default language for pre-rendered pages
    const html = createSoftwareHtml(baseHtml, software, 'zh-CN');
    
    // Create directory for this software using sanitized name
    // This handles special characters that might cause filesystem issues
    const safeDirName = sanitizeDirectoryName(software.name);
    const softwarePageDir = path.join(softwareDir, safeDirName);
    if (!fs.existsSync(softwarePageDir)) {
      fs.mkdirSync(softwarePageDir, { recursive: true });
    }
    
    // Write index.html for this software
    const outputPath = path.join(softwarePageDir, 'index.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    
    console.log(`  ✓ ${software.name}`);
    generatedCount++;
  }
  
  console.log(`\n预渲染完成！共生成 ${generatedCount} 个软件页面`);
  console.log(`输出目录: ${softwareDir}`);
}

main().catch(console.error);
