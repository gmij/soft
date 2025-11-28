import type { SoftwareData } from '../types';

// 获取软件数据
export async function fetchSoftwareData(): Promise<SoftwareData> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/software.json`);
  if (!response.ok) {
    throw new Error('Failed to fetch software data');
  }
  return response.json();
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
