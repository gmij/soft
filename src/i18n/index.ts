import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

// 默认语言
const DEFAULT_LANGUAGE = 'zh-CN';

// 获取浏览器语言
function getBrowserLanguage(): string {
  const browserLang = navigator.language || 
    (navigator.languages && navigator.languages.length > 0 ? navigator.languages[0] : null) || 
    DEFAULT_LANGUAGE;
  
  // 支持的语言列表
  const supportedLanguages = ['zh-CN', 'en'];
  
  // 精确匹配
  if (supportedLanguages.includes(browserLang)) {
    return browserLang;
  }
  
  // 前缀匹配 (如 zh-TW -> zh-CN, en-US -> en)
  const langPrefix = browserLang.split('-')[0];
  if (langPrefix === 'zh') {
    return 'zh-CN';
  }
  if (langPrefix === 'en') {
    return 'en';
  }
  
  // 默认使用中文
  return 'zh-CN';
}

// 从 localStorage 获取保存的语言偏好
function getSavedLanguage(): string | null {
  try {
    return localStorage.getItem('language');
  } catch {
    return null;
  }
}

// 保存语言偏好到 localStorage
export function saveLanguage(lang: string): void {
  try {
    localStorage.setItem('language', lang);
  } catch {
    // localStorage 不可用时忽略
  }
}

const savedLang = getSavedLanguage();
const defaultLang = savedLang || getBrowserLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en': { translation: en },
    },
    lng: defaultLang,
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
