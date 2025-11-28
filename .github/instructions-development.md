# 开发岗位 Copilot 使用指南

本指南适用于软件开发工程师，帮助您更高效地使用 GitHub Copilot 完成日常开发工作。

## 项目背景

本项目是一个**软件下载资源站**，开发相关信息：

- **前端框架**：React + Ant Design
- **构建工具**：
  - **Vite**：推荐用于新项目，构建速度快，开发体验好
  - **Create React App**：适合简单项目，配置简单但构建较慢
- **部署方式**：GitHub Actions + GitHub Pages
- **编程语言**：TypeScript/JavaScript、Node.js（构建脚本）

### 核心开发任务

1. 实现资源目录扫描脚本
2. 开发 React 前端页面组件
3. 集成 Ant Design 组件库
4. 配置静态站点生成

## 适用场景

### 代码编写

使用 Copilot 辅助完成各类代码编写工作：

- React 组件开发
- Ant Design 组件集成
- 资源扫描脚本
- 构建配置

**提示词示例：**
```
请帮我实现一个 Node.js 脚本，功能：
- 扫描 down/ 目录下的所有软件资源
- 解析目录结构 down/{resourceName}/{version}/
- 判断是否存在 link.txt（P2P下载）
- 输出资源列表的 JSON 文件
```

### 组件开发

- Ant Design 组件封装
- 页面布局组件
- 下载按钮组件
- 资源列表组件

### 构建脚本

- 资源目录扫描
- JSON 数据生成
- 静态页面构建
- 部署脚本

## 最佳实践

### 资源扫描脚本

编写资源目录扫描脚本：

```
请实现 Node.js 资源扫描脚本：

功能：
- 递归扫描 down/ 目录
- 解析 {resourceName}/{version}/ 结构
- 检测 link.txt 判断下载类型
- 生成资源列表 JSON

输出格式：
{
  "resources": [{
    "name": "软件名",
    "versions": [{
      "version": "1.0.0",
      "type": "direct|p2p",
      "files": ["file1.exe"] | "p2pLink": "magnet:..."
    }]
  }]
}
```

### React 组件开发

```
请使用 React + Ant Design 实现软件下载卡片组件：

功能：
- 显示软件名称和图标
- 版本选择下拉框
- 下载按钮（区分直接下载和 P2P）
- 响应式布局

使用的 Ant Design 组件：
- Card、Select、Button、Tag
```

### Ant Design 集成

```
请帮我配置 Ant Design 的按需加载：
构建工具：[Vite/CRA]

要求：
- 按需导入组件
- 自定义主题色
- 优化打包体积
```

## 常用提示词模板

### 页面组件开发

```
请使用 React + Ant Design 实现软件列表页面：

功能：
- 软件分类筛选
- 软件卡片网格展示
- 搜索功能
- 分页或无限滚动

数据来源：构建时生成的 resources.json
```

### 下载功能实现

```
请实现下载按钮组件：

props:
- downloadType: 'direct' | 'p2p'
- files?: string[]  // 直接下载的文件列表
- p2pLink?: string  // P2P 下载链接

功能：
- 直接下载：生成文件下载链接
- P2P 下载：显示链接并支持复制
- 使用 Ant Design Button 和 Modal 组件
```

### 静态站点配置

```
请帮我配置 React 项目的静态站点生成：
部署目标：GitHub Pages
基础路径：/{repo-name}/

配置内容：
- 路由配置（HashRouter 或配置 404.html）
- 资源路径处理
- 构建输出目录
```

### TypeScript 类型定义

```
请为软件资源定义 TypeScript 类型：

需要定义：
- Resource（软件资源）
- Version（版本信息）
- DownloadInfo（下载信息，区分直接下载和 P2P）

参考目录结构：down/{resourceName}/{version}/
```

## 注意事项

- 使用 TypeScript 提高代码质量
- Ant Design 组件按需导入优化包体积
- 静态资源路径需要考虑 GitHub Pages 的基础路径
- 资源扫描脚本需要处理特殊字符的文件名
- P2P 链接显示需要考虑用户体验
- 确保生成的静态页面 SEO 友好
