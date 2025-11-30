import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWN_DIR = path.resolve(__dirname, '../down');
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');

interface ResourceInfo {
  name: string;
  path: string;
  versions: VersionInfo[];
  hasReadme: boolean;
}

interface VersionInfo {
  version: string;
  path: string;
  files: string[];
  hasLinkTxt: boolean;
  p2pLink?: string;
}

/**
 * Scan the down directory for resources that need readme.md files
 */
function scanResourcesNeedingReadme(): ResourceInfo[] {
  const resources: ResourceInfo[] = [];

  if (!fs.existsSync(DOWN_DIR)) {
    console.log('down/ directory does not exist');
    return resources;
  }

  const resourceDirs = fs.readdirSync(DOWN_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const resourceName of resourceDirs) {
    const resourcePath = path.join(DOWN_DIR, resourceName);
    const hasReadme = fs.existsSync(path.join(resourcePath, 'readme.md')) ||
                      fs.existsSync(path.join(resourcePath, 'readme.zh-CN.md')) ||
                      fs.existsSync(path.join(resourcePath, 'readme.en.md'));

    // Scan versions
    const versionDirs = fs.readdirSync(resourcePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const versions: VersionInfo[] = [];
    for (const versionName of versionDirs) {
      const versionPath = path.join(resourcePath, versionName);
      const linkTxtPath = path.join(versionPath, 'link.txt');
      const hasLinkTxt = fs.existsSync(linkTxtPath);

      let files: string[] = [];
      let p2pLink: string | undefined;

      if (hasLinkTxt) {
        p2pLink = fs.readFileSync(linkTxtPath, 'utf-8').trim();
      } else {
        files = fs.readdirSync(versionPath)
          .filter(file => {
            const filePath = path.join(versionPath, file);
            const lowerFile = file.toLowerCase();
            const isReadme = lowerFile === 'readme.md' ||
              lowerFile === 'readme.zh-cn.md' ||
              lowerFile === 'readme.en.md';
            return fs.statSync(filePath).isFile() && !isReadme;
          });
      }

      versions.push({
        version: versionName,
        path: versionPath,
        files,
        hasLinkTxt,
        p2pLink,
      });
    }

    if (!hasReadme) {
      resources.push({
        name: resourceName,
        path: resourcePath,
        versions,
        hasReadme,
      });
    }
  }

  return resources;
}

/**
 * Read template files
 */
function readTemplates(): { zhTemplate: string; enTemplate: string } {
  const zhTemplate = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'readme.zh-CN.md.example'),
    'utf-8'
  );
  const enTemplate = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'readme.en.md.example'),
    'utf-8'
  );
  return { zhTemplate, enTemplate };
}

/**
 * Call LLM API to generate readme content
 */
async function callLLM(prompt: string): Promise<string> {
  const apiKey = process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY;
  const apiEndpoint = process.env.LLM_API_ENDPOINT || 'https://models.inference.ai.azure.com';
  const modelName = process.env.LLM_MODEL || 'gpt-4o';

  if (!apiKey) {
    throw new Error('No API key found. Set GITHUB_TOKEN or OPENAI_API_KEY environment variable.');
  }

  const response = await fetch(`${apiEndpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: '你是一个技术文档撰写专家，擅长为软件编写清晰、专业的说明文档。请用中文回复。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0].message.content;
}

/**
 * Generate readme.md for a resource using LLM
 */
async function generateReadmeForResource(resource: ResourceInfo, templates: { zhTemplate: string; enTemplate: string }): Promise<void> {
  console.log(`\nGenerating readme for: ${resource.name}`);

  // Build context for the LLM
  const versionInfo = resource.versions.map(v => {
    if (v.hasLinkTxt) {
      return `- 版本 ${v.version}: P2P下载 (${v.p2pLink})`;
    } else {
      return `- 版本 ${v.version}: 直接下载, 文件: ${v.files.join(', ')}`;
    }
  }).join('\n');

  const prompt = `请为软件 "${resource.name}" 生成一个 readme.md 文件。

以下是该软件的基本信息：
- 软件名称: ${resource.name}
- 可用版本信息:
${versionInfo}

请参考以下模板格式生成中文说明文档：

${templates.zhTemplate}

要求：
1. 根据软件名称推测软件的功能和用途
2. 如果软件名称包含版本信息或特殊标记，请在描述中说明
3. 生成的内容要专业、清晰
4. 只输出 markdown 内容，不要包含任何解释或说明
5. 如果无法确定某些信息（如官方网站），可以省略该部分或标注"请补充"`;

  try {
    const content = await callLLM(prompt);
    const readmePath = path.join(resource.path, 'readme.md');
    fs.writeFileSync(readmePath, content, 'utf-8');
    console.log(`  ✓ Generated: ${readmePath}`);
  } catch (error) {
    console.error(`  ✗ Failed to generate readme for ${resource.name}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('=== Readme Generator ===');
  console.log('Scanning for resources without readme.md...\n');

  const resources = scanResourcesNeedingReadme();

  if (resources.length === 0) {
    console.log('All resources already have readme.md files.');
    return;
  }

  console.log(`Found ${resources.length} resource(s) without readme.md:`);
  resources.forEach(r => console.log(`  - ${r.name}`));

  const templates = readTemplates();

  let successCount = 0;
  let failCount = 0;

  for (const resource of resources) {
    try {
      await generateReadmeForResource(resource, templates);
      successCount++;
    } catch (error) {
      console.error(`Error generating readme for ${resource.name}:`, error);
      failCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
