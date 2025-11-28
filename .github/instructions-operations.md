# 运维岗位 Copilot 使用指南

本指南适用于运维工程师和 DevOps 工程师，帮助您更高效地使用 GitHub Copilot 完成运维相关工作。

## 项目背景

本项目是一个**软件下载资源站**，运维相关信息：

- **部署平台**：GitHub Pages（静态托管）
- **CI/CD**：GitHub Actions
- **构建产物**：静态 HTML/JS/CSS 文件
- **资源管理**：基于 Git 仓库的文件管理

### 核心运维任务

1. 配置 GitHub Actions 自动构建和部署
2. 管理资源文件的上传和更新
3. 监控站点可用性
4. 优化构建流程

## 适用场景

### GitHub Actions 配置

使用 Copilot 辅助编写 GitHub Actions 工作流：

- 资源变更触发构建
- 静态页面生成
- 部署到 GitHub Pages
- 构建缓存优化

**提示词示例：**
```
请帮我编写 GitHub Actions 工作流，功能：
- 当 down/ 目录或源代码变更时触发
- 执行资源扫描脚本生成 resources.json
- 构建 React 静态站点
- 部署到 GitHub Pages 的 gh-pages 分支
```

### 资源管理

- 资源文件上传脚本
- 目录结构验证
- 资源清单生成
- 版本管理

### 站点监控

- 页面可用性检查
- 下载链接验证
- 构建状态通知
- 错误告警

## 最佳实践

### GitHub Actions 工作流

```
请编写完整的 GitHub Actions 部署工作流：
文件：.github/workflows/deploy.yml

触发条件：
- push 到 main 分支
- down/ 目录变更
- 手动触发

步骤：
1. Checkout 代码
2. 设置 Node.js 环境
3. 安装依赖（使用缓存）
4. 执行资源扫描脚本
5. 构建 React 应用
6. 部署到 GitHub Pages

要求：
- 使用 actions/cache 缓存 node_modules
- 配置 GITHUB_TOKEN 权限
- 添加构建状态徽章
```

### 资源上传脚本

```
请编写资源文件上传辅助脚本：
功能：
- 创建正确的目录结构 down/{name}/{version}/
- 验证文件格式
- 生成 link.txt（如果是 P2P 资源）
- 提交到 Git 仓库

参数：
- 软件名称
- 版本号
- 文件路径或 P2P 链接
```

### 构建缓存优化

```
请优化 GitHub Actions 的构建缓存配置：

缓存目标：
- node_modules 目录
- npm 缓存
- 构建缓存（如 .next/cache）

要求：
- 基于 package-lock.json 生成缓存 key
- 支持缓存回退
- 显示缓存命中状态
```

## 常用提示词模板

### GitHub Pages 部署配置

```
请配置 GitHub Pages 部署：
源：gh-pages 分支
自定义域名：[可选]

配置内容：
- 仓库 Settings > Pages 配置说明
- CNAME 文件（如果使用自定义域名）
- 404.html 处理（SPA 路由支持）
```

### 站点监控脚本

```
请编写站点可用性监控脚本：
检查项目：
- 首页可访问
- 关键页面响应正常
- 静态资源加载成功

输出：
- 检查结果报告
- 失败时发送通知（可选）
```

### 资源目录验证

```
请编写资源目录结构验证脚本：
验证规则：
- 目录层级正确 down/{name}/{version}/
- link.txt 格式正确（如果存在）
- 文件名不含特殊字符
- 无空目录

输出：
- 验证通过/失败
- 问题详情列表
```

### 构建失败通知

```
请配置 GitHub Actions 构建失败通知：
通知方式：
- GitHub Issue 自动创建
- 或 Slack/钉钉 通知（可选）

通知内容：
- 失败的工作流名称
- 失败步骤
- 错误日志摘要
- 触发者信息
```

## 注意事项

- GitHub Pages 有存储和带宽限制（详见[官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#usage-limits)）
- 大文件资源建议使用外部存储或 P2P 方式
- GitHub Actions 免费额度有限，注意优化构建时间
- 敏感信息使用 GitHub Secrets 管理
- 定期检查构建日志，及时发现问题
- 保持 down/ 目录结构规范，便于自动化处理
