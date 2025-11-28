# 软件下载站

一个简洁的软件下载资源站，支持直接下载和 P2P 下载两种方式。

## 功能特点

- 🎨 **现代化界面**：采用 React + Ant Design 构建，简洁美观
- 📦 **多种下载方式**：支持直接下载和 P2P 磁力链接
- 📝 **Markdown 支持**：软件描述支持 Markdown 格式
- 🚀 **自动部署**：通过 GitHub Actions 自动构建部署到 GitHub Pages
- 📱 **响应式设计**：支持桌面端和移动端访问

## 目录结构

```
down/
├── {软件名称}/
│   ├── readme.md         # 软件描述文件（可选，作为默认描述）
│   └── {版本号}/
│       ├── readme.md     # 版本描述文件（可选，优先于上级 readme.md）
│       ├── link.txt      # 存在则表示 P2P 下载，内容为 P2P 地址
│       └── {文件}        # 不存在 link.txt 时，目录下文件用于直接下载
```

## 添加软件

1. 在 `down/` 目录下创建以软件名称命名的文件夹
2. 在软件文件夹下创建 `readme.md` 描述软件（可选）
3. 创建版本号文件夹（如 `v1.0.0`）
4. 根据下载方式添加内容：
   - **直接下载**：将下载文件放入版本文件夹
   - **P2P 下载**：创建 `link.txt` 文件，内容为磁力链接

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

## 技术栈

- **前端框架**：React 19
- **UI 组件库**：Ant Design 6
- **构建工具**：Vite 7
- **路由**：React Router
- **Markdown 渲染**：react-markdown
- **部署平台**：GitHub Pages

## 许可证

MIT License
