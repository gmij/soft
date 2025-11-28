# 架构岗位 Copilot 使用指南

本指南适用于系统架构师和技术负责人，帮助您更高效地使用 GitHub Copilot 完成架构设计和技术决策工作。

## 项目背景

本项目是一个**软件下载资源站**，技术架构特点：

- **静态网站**：所有页面在构建时生成，部署到 GitHub Pages
- **前端技术**：React + Ant Design 组件库
- **构建流程**：GitHub Actions 自动化构建和部署
- **资源管理**：基于文件系统的资源目录结构

### 目录结构设计

```
down/
├── chrome/                    # 软件名称
│   ├── readme.md             # 软件描述（作为默认描述）
│   └── 115.0.5790/           # 版本号
│       ├── readme.md         # 版本描述（优先于上级 readme.md）
│       ├── link.txt          # P2P 下载地址文件（存在则为 P2P 下载）
│       └── chrome-win64.zip  # 直接下载的资源文件
├── vscode/
│   ├── readme.md             # VSCode 软件描述
│   ├── 1.85.0/
│   │   ├── readme.md         # 1.85.0 版本特有描述
│   │   └── vscode-win.exe
│   └── 1.84.0/
│       └── link.txt          # 无 readme.md，使用上级目录的描述
```

### 资源描述优先级

1. **版本描述**：优先使用 `{resourceName}/{version}/readme.md`
2. **默认描述**：如果版本目录没有 readme.md，使用 `{resourceName}/readme.md`
3. readme.md 用于展示软件介绍、功能说明、更新日志等

## 适用场景

### 架构设计

使用 Copilot 辅助完成系统架构设计工作：

- 静态站点生成方案
- 资源目录解析逻辑
- 前端组件架构
- 构建流水线设计

**提示词示例：**
```
请帮我设计静态资源站的构建架构，需要支持：
- 扫描 down 目录获取所有软件资源
- 解析 link.txt 判断下载方式
- 生成 React 静态页面
- 部署到 GitHub Pages
```

### 技术选型

- React 框架选择（CRA vs Vite vs Next.js SSG）
- Ant Design 组件库版本
- 静态站点生成工具
- GitHub Actions 配置方案

### 系统设计

- 资源数据模型设计
- 页面路由结构
- 组件复用设计
- 构建脚本架构

## 最佳实践

### 架构决策记录（ADR）

使用 Copilot 生成标准化的 ADR 文档：

```
请帮我编写一个架构决策记录（ADR），主题是：选择静态站点生成方案

包含以下部分：
- 状态：[提议/接受/废弃/替代]
- 背景：软件下载站需要高性能、易部署的方案
- 决策：具体的技术选型
- 后果：对构建流程和维护的影响
```

### 资源数据模型

```
请设计软件资源的数据模型：
数据来源：down/{resourceName}/{version}/ 目录结构
下载类型：
- 直接下载（目录下的文件）
- P2P 下载（link.txt 中的地址）

资源描述：
- 优先使用 {version}/readme.md
- 如果不存在，使用 {resourceName}/readme.md 作为默认描述

输出：
- TypeScript 类型定义
- 数据解析逻辑
- readme.md 解析和渲染
```

### 系统架构图

使用 Mermaid 或 PlantUML 语法生成架构图：

```
请用 Mermaid 语法绘制软件下载站的构建和部署架构图：
- 资源目录扫描
- 静态页面生成
- GitHub Actions 构建
- GitHub Pages 部署
```

## 常用提示词模板

### 前端组件架构

```
请帮我设计 React + Ant Design 的组件架构：
页面列表：
- 首页（软件分类列表）
- 软件详情页（版本列表、下载按钮）
- 分类页面

要求：
- 组件层次结构
- 数据流设计
- 复用组件识别
```

### 构建脚本设计

```
请设计资源扫描和页面生成的构建脚本架构：
输入：down/ 目录结构
输出：静态 HTML 页面

功能：
- 递归扫描资源目录
- 解析 link.txt 文件
- 解析 readme.md 文件（版本目录优先，否则使用软件目录的）
- 生成资源列表 JSON
- 触发 React 构建
```

### GitHub Pages 部署方案

```
请设计 GitHub Actions 到 GitHub Pages 的部署方案：
触发条件：
- down/ 目录变更
- 代码变更

流程：
- 资源扫描
- 静态页面生成
- 部署到 gh-pages 分支
```

## 注意事项

- 静态站点架构需要考虑构建时间优化
- 大量资源文件时的目录扫描性能
- GitHub Pages 的使用限制（存储和带宽）
- Ant Design 组件的按需加载
- 构建产物的缓存策略
- P2P 下载链接的安全性验证
