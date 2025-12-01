import type { SoftwareData, LocalizedDescription } from '../types';

// 获取软件数据
export async function fetchSoftwareData(): Promise<SoftwareData> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/software.json`);
  if (!response.ok) {
    throw new Error('Failed to fetch software data');
  }
  return response.json();
}

/**
 * Get the description for the current language
 * Falls back to any available language if the preferred language is not available
 */
export function getLocalizedDescription(
  descriptions: LocalizedDescription | undefined,
  legacyDescription: string | undefined,
  language: string
): string | undefined {
  // If we have multilingual descriptions, use them
  if (descriptions) {
    // Map i18next language code to our keys
    const langKey = language === 'en' ? 'en' : 'zh-CN';
    const fallbackKey = language === 'en' ? 'zh-CN' : 'en';
    
    // Try preferred language first, then fallback
    return descriptions[langKey] || descriptions[fallbackKey] || legacyDescription;
  }
  
  // Fall back to legacy single description
  return legacyDescription;
}

// Hidden iframe for downloads to avoid visual flash
let downloadIframe: HTMLIFrameElement | null = null;

/**
 * Trigger file download using a hidden iframe to avoid popup flash
 */
export function triggerDownload(url: string): void {
  // Create iframe if it doesn't exist
  if (!downloadIframe) {
    downloadIframe = document.createElement('iframe');
    downloadIframe.style.display = 'none';
    downloadIframe.setAttribute('aria-hidden', 'true');
    downloadIframe.name = 'download-frame';
    document.body.appendChild(downloadIframe);
  }
  
  // For direct file downloads, use iframe
  // This avoids the visual flash of window.open
  downloadIframe.src = url;
}

/**
 * Update page SEO meta tags dynamically
 */
export function updatePageMeta(options: {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalPath?: string;
}): void {
  // Update title
  document.title = options.title;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', options.description);
  }
  
  // Update meta keywords
  if (options.keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', options.keywords);
  }
  
  // Update Open Graph title
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', options.ogTitle || options.title);
  }
  
  // Update Open Graph description
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', options.ogDescription || options.description);
  }
  
  // Update Twitter title
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', options.ogTitle || options.title);
  }
  
  // Update Twitter description
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', options.ogDescription || options.description);
  }
  
  // Use the current origin and base path for URLs
  const baseUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
  
  // Update canonical URL
  if (options.canonicalPath !== undefined) {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `${baseUrl}${options.canonicalPath}`);
    }
  }
  
  // Update hreflang links
  const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
  hreflangLinks.forEach((link) => {
    const currentPath = options.canonicalPath !== undefined ? options.canonicalPath : '';
    link.setAttribute('href', `${baseUrl}${currentPath}`);
  });
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? ext.toUpperCase() : '';
}

// 将 Markdown 内容转换为纯文本（用于预览）
export function stripMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  return markdown
    // Remove code blocks but keep content
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')
    // Remove headers (# ## ### etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold markers (process double before single)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic markers
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Collapse multiple newlines and spaces
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
