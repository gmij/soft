# 软件下载站

一个简洁的软件下载资源站，支持直接下载和 P2P 下载两种方式。

## 功能特点

- 🎨 **现代化界面**：采用 React + Ant Design 构建，简洁美观
- 📦 **多种下载方式**：支持直接下载和 P2P 磁力链接
- 📝 **Markdown 支持**：软件描述支持 Markdown 格式
- 🏷️ **标签分类**：支持为软件添加分类标签，便于筛选
- 🌐 **多语言支持**：支持中文和英文，自动根据浏览器语言切换
- 🚀 **自动部署**：通过 GitHub Actions 自动构建部署到 GitHub Pages
- 📱 **响应式设计**：支持桌面端和移动端访问

## 目录结构

```
down/
├── {软件名称}/
│   ├── readme.md         # 软件描述文件（中文，可选）
│   ├── readme.en.md      # 软件描述文件（英文，可选）
│   ├── tags.txt          # 软件标签文件（可选，每行一个标签）
│   └── {版本号}/
│       ├── readme.md     # 版本描述文件（中文，可选）
│       ├── readme.en.md  # 版本描述文件（英文，可选）
│       ├── link.txt      # 存在则表示 P2P 下载，内容为 P2P 地址
│       └── {文件}        # 不存在 link.txt 时，目录下文件用于直接下载
```

## 添加软件

1. 在 `down/` 目录下创建以软件名称命名的文件夹
2. 在软件文件夹下创建描述文件（可选）：
   - `readme.md` - 中文描述（或 `readme.zh-CN.md`）
   - `readme.en.md` - 英文描述
3. 在软件文件夹下创建 `tags.txt` 添加分类标签（可选）
4. 创建版本号文件夹（如 `v1.0.0`）
5. 根据下载方式添加内容：
   - **直接下载**：将下载文件放入版本文件夹
   - **P2P 下载**：创建 `link.txt` 文件，内容为磁力链接

### 使用模板

为了方便创建中英文 readme 文件，我们提供了模板文件，位于 `templates/` 目录：

- `readme.zh-CN.md.example` - 中文软件描述模板
- `readme.en.md.example` - 英文软件描述模板
- `version-readme.zh-CN.md.example` - 中文版本说明模板
- `version-readme.en.md.example` - 英文版本说明模板

详细使用说明请参阅 [templates/README_TEMPLATE.md](templates/README_TEMPLATE.md)。

## 支持的标签

| 标签 ID | 中文名称 | English |
|---------|---------|---------|
| development | 开发工具 | Development |
| office | 办公软件 | Office |
| media | 媒体工具 | Media |
| system | 系统工具 | System |
| network | 网络工具 | Network |
| security | 安全软件 | Security |
| game | 游戏娱乐 | Games |
| other | 其他 | Other |

## 多语言支持

网站支持以下语言：
- 简体中文 (zh-CN)
- English (en)

系统会自动根据浏览器语言设置选择合适的语言，用户也可以通过页面右上角的语言切换器手动切换语言。

### 多语言 Readme 文件

软件描述支持多语言，系统会根据当前语言自动显示对应的描述：

| 文件名 | 语言 | 说明 |
|--------|------|------|
| `readme.md` | 中文 | 中文描述（默认） |
| `readme.zh-CN.md` | 中文 | 中文描述（等同于 readme.md） |
| `readme.en.md` | 英文 | 英文描述 |

如果某个语言的描述文件不存在，系统会自动使用其他可用语言的描述。

## 本地开发

```bash
# 安装依赖
npm install

# 生成软件数据
npm run generate

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 部署

### GitHub Pages

项目配置了 GitHub Actions 自动部署到 GitHub Pages。每次推送到 main 分支时，会自动触发构建和部署流程。

### Cloudflare Pages

项目支持部署到 Cloudflare Pages，配置文件为 `wrangler.jsonc`。

部署方式：

1. **使用 Wrangler CLI**：
   ```bash
   # 构建项目（设置 BASE_PATH 为根路径）
   BASE_PATH=/ npm run build
   
   # 部署到 Cloudflare Pages
   npx wrangler deploy
   ```

2. **使用 Cloudflare Pages Dashboard**：
   - 连接 GitHub 仓库
   - 设置构建命令：`BASE_PATH=/ npm run build`
   - 设置构建输出目录：`dist`
   - 或在 Cloudflare Pages 设置中添加环境变量：`BASE_PATH` = `/`

## 技术栈

- **前端框架**：React 19
- **UI 组件库**：Ant Design 6
- **构建工具**：Vite 7
- **路由**：React Router
- **国际化**：i18next + react-i18next
- **Markdown 渲染**：react-markdown
- **部署平台**：GitHub Pages / Cloudflare Pages

## 许可证

MIT License
