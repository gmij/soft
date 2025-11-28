import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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
  versions: SoftwareVersion[];
}

interface SoftwareData {
  software: Software[];
  generatedAt: string;
}

const DOWN_DIR = path.resolve(__dirname, '../down');
const OUTPUT_DIR = path.resolve(__dirname, '../public/data');

function readReadme(dirPath: string): string | undefined {
  const readmePath = path.join(dirPath, 'readme.md');
  if (fs.existsSync(readmePath)) {
    return fs.readFileSync(readmePath, 'utf-8');
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
      software.push({
        name: softwareName,
        description: softwareDescription,
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
