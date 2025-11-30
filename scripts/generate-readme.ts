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
  hasEnReadme: boolean;
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
                      fs.existsSync(path.join(resourcePath, 'readme.zh-CN.md'));
    const hasEnReadme = fs.existsSync(path.join(resourcePath, 'readme.en.md'));

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

    // Include if either readme is missing
    if (!hasReadme || !hasEnReadme) {
      resources.push({
        name: resourceName,
        path: resourcePath,
        versions,
        hasReadme,
        hasEnReadme,
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
async function callLLM(prompt: string, systemPrompt: string): Promise<string> {
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
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
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
 * Generate Chinese readme.md for a resource using LLM
 */
async function generateChineseReadme(resource: ResourceInfo, templates: { zhTemplate: string; enTemplate: string }): Promise<void> {
  console.log(`  Generating Chinese readme...`);

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
1. 【重要】第一段必须是简洁明了的软件介绍（50-80字），让用户一眼就能明白这个软件是做什么的，用户在首页就能看到这段介绍
2. 根据软件名称推测软件的功能和用途，如果是知名软件请基于真实信息
3. 如果软件名称包含版本信息或特殊标记，请在描述中说明
4. 生成的内容要专业、清晰
5. 只输出 markdown 内容，不要包含任何解释或说明
6. 如果无法确定某些信息（如官方网站），可以省略该部分

【GEO优化 - FAQ部分】请在文档末尾添加一个"常见问题"或"为什么推荐这个软件？"部分，使用问答（Q&A）格式，3-5个问题。
这些问答应该：
- 帮助用户快速理解为什么选择这个软件
- 解答用户可能关心的核心问题
- 使用自然语言，便于AI搜索引擎理解和收录
- 问题要具体、有针对性

示例格式：
## 为什么推荐这个软件？

**Q: 这个软件主要解决什么问题？**
A: [具体回答]

**Q: 相比同类软件有什么优势？**
A: [具体回答]

**Q: 适合哪些用户使用？**
A: [具体回答]`;

  const systemPrompt = '你是一个技术文档撰写专家，擅长为软件编写清晰、专业的说明文档。你了解SEO和GEO（Generative Engine Optimization）优化技巧，能够创建便于搜索引擎和AI理解的内容。请用中文回复。';

  const content = await callLLM(prompt, systemPrompt);
  const readmePath = path.join(resource.path, 'readme.md');
  fs.writeFileSync(readmePath, content, 'utf-8');
  console.log(`    ✓ Generated: ${readmePath}`);
}

/**
 * Generate English readme.en.md for a resource using LLM
 */
async function generateEnglishReadme(resource: ResourceInfo, templates: { zhTemplate: string; enTemplate: string }): Promise<void> {
  console.log(`  Generating English readme...`);

  // Build context for the LLM
  const versionInfo = resource.versions.map(v => {
    if (v.hasLinkTxt) {
      return `- Version ${v.version}: P2P download (${v.p2pLink})`;
    } else {
      return `- Version ${v.version}: Direct download, files: ${v.files.join(', ')}`;
    }
  }).join('\n');

  const prompt = `Please generate a readme.en.md file for the software "${resource.name}".

Software information:
- Software name: ${resource.name}
- Available versions:
${versionInfo}

Please use the following template as a reference:

${templates.enTemplate}

Requirements:
1. [IMPORTANT] The first paragraph must be a clear and concise introduction (50-80 words) that immediately tells users what this software does - this will be displayed on the homepage
2. Based on the software name, describe its features and use cases. If it's a well-known software, use accurate information
3. If the software name contains version info or special markers, explain them
4. Content should be professional and clear
5. Output only markdown content, no explanations
6. If certain information is unknown (like official website), omit that section

【GEO Optimization - FAQ Section】Please add a "Frequently Asked Questions" or "Why Choose This Software?" section at the end, using Q&A format with 3-5 questions.
These Q&As should:
- Help users quickly understand why to choose this software
- Answer core questions users might have
- Use natural language that AI search engines can easily understand and index
- Questions should be specific and targeted

Example format:
## Why Choose This Software?

**Q: What problem does this software solve?**
A: [Specific answer]

**Q: What advantages does it have over similar software?**
A: [Specific answer]

**Q: Who is this software suitable for?**
A: [Specific answer]`;

  const systemPrompt = 'You are a technical documentation expert skilled at writing clear, professional software documentation. You understand SEO and GEO (Generative Engine Optimization) techniques to create content that is easily understood by search engines and AI. Please respond in English.';

  const content = await callLLM(prompt, systemPrompt);
  const readmePath = path.join(resource.path, 'readme.en.md');
  fs.writeFileSync(readmePath, content, 'utf-8');
  console.log(`    ✓ Generated: ${readmePath}`);
}

/**
 * Generate readme files for a resource
 */
async function generateReadmeForResource(resource: ResourceInfo, templates: { zhTemplate: string; enTemplate: string }): Promise<void> {
  console.log(`\nGenerating readme for: ${resource.name}`);

  try {
    // Generate Chinese readme if missing
    if (!resource.hasReadme) {
      await generateChineseReadme(resource, templates);
    } else {
      console.log(`  ⊘ Chinese readme already exists, skipping`);
    }

    // Generate English readme if missing
    if (!resource.hasEnReadme) {
      await generateEnglishReadme(resource, templates);
    } else {
      console.log(`  ⊘ English readme already exists, skipping`);
    }
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
  console.log('Scanning for resources without readme.md files...\n');

  const resources = scanResourcesNeedingReadme();

  if (resources.length === 0) {
    console.log('All resources already have both Chinese and English readme.md files.');
    return;
  }

  console.log(`Found ${resources.length} resource(s) needing readme generation:`);
  resources.forEach(r => {
    const missing = [];
    if (!r.hasReadme) missing.push('zh-CN');
    if (!r.hasEnReadme) missing.push('en');
    console.log(`  - ${r.name} (missing: ${missing.join(', ')})`);
  });

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
