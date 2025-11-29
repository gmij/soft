// 多语言描述类型
export interface LocalizedDescription {
  'zh-CN'?: string;
  'en'?: string;
}

// 软件资源类型定义
export interface SoftwareVersion {
  version: string;
  description?: string;
  descriptions?: LocalizedDescription;
  downloadType: 'direct' | 'p2p';
  files?: string[];
  p2pLink?: string;
}

export interface Software {
  name: string;
  description?: string;
  descriptions?: LocalizedDescription;
  tags?: string[];
  versions: SoftwareVersion[];
}

export interface SoftwareData {
  software: Software[];
  generatedAt: string;
}

// 预定义的标签类型
export type TagType = 
  | 'development'
  | 'office'
  | 'media'
  | 'system'
  | 'network'
  | 'security'
  | 'game'
  | 'other';

// 标签颜色映射
export const TAG_COLORS: Record<TagType, string> = {
  development: 'blue',
  office: 'green',
  media: 'purple',
  system: 'orange',
  network: 'cyan',
  security: 'red',
  game: 'magenta',
  other: 'default',
};
