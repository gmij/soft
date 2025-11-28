// 软件资源类型定义
export interface SoftwareVersion {
  version: string;
  description?: string;
  downloadType: 'direct' | 'p2p';
  files?: string[];
  p2pLink?: string;
}

export interface Software {
  name: string;
  description?: string;
  versions: SoftwareVersion[];
}

export interface SoftwareData {
  software: Software[];
  generatedAt: string;
}
