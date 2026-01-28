# 软件申请功能 / Software Request Feature

[English](#english) | [中文](#中文)

---

## 中文

### 功能概述

软件申请功能允许用户通过网站直接申请添加新的软件资源。系统会自动创建 GitHub Issue，并通过 GitHub Actions 工作流协助处理申请。

### 用户使用指南

#### 1. 提交软件申请

1. 访问网站首页
2. 点击页面右上角的 **"申请软件"** 按钮
3. 在弹出的对话框中填写：
   - **软件名称**（必填）：您需要的软件名称
   - **补充说明**（可选）：版本要求、用途等额外信息
4. 点击 **"提交申请"** 按钮
5. 系统会打开 GitHub Issue 创建页面（已预填内容）
6. 确认信息无误后，在 GitHub 上提交 Issue

#### 2. 跟踪申请进度

- 提交后，您可以在 GitHub Issues 中查看申请状态
- 系统会自动添加评论更新处理进度
- 管理员审核通过后，软件将自动出现在网站上

### 管理员处理指南

#### 自动化流程

当用户创建带有 `software-request` 标签的 Issue 时，工作流会自动：

1. 提取软件名称和补充信息
2. 创建处理分支 `software-request-{issue-number}`
3. 生成详细的处理指南文件（`.github/agent-instructions/software-request-{issue-number}.md`）
4. 在 Issue 中添加进度评论

#### 手动处理步骤

1. **切换到处理分支**
   ```bash
   git fetch origin
   git checkout software-request-{issue-number}
   ```

2. **查看处理指南**
   - 打开 `.github/agent-instructions/software-request-{issue-number}.md`
   - 阅读详细的任务要求和规范

3. **搜索软件信息**
   - 使用 GitHub Copilot 或手动搜索软件官网
   - 确认软件名称、下载地址、主要特性等

4. **创建资源文件**

   在 `down/{软件名称}/` 目录下创建：
   
   ```
   {软件名称}/
   ├── readme.md         # 中文描述
   ├── readme.en.md      # 英文描述
   ├── tags.txt          # 分类标签
   └── latest/           # 最新版本
       └── link.txt      # 官网下载链接
   ```

5. **提交 Pull Request**
   ```bash
   git add .
   git commit -m "feat: add {软件名称}"
   git push origin software-request-{issue-number}
   ```
   
   然后在 GitHub 上创建 PR，关联原 Issue（在 PR 描述中添加 `Closes #{issue-number}`）

6. **审核和合并**
   - 检查资源文件格式和内容
   - 确认描述准确、链接有效
   - 合并 PR，Issue 将自动关闭

### 工作流配置

工作流文件位于 `.github/workflows/handle-software-request.yml`

#### 触发条件
- Issue 被创建或添加 `software-request` 标签

#### 主要步骤
1. 提取软件信息
2. 创建初始评论
3. 生成处理指南
4. 创建处理分支
5. 添加手动处理说明

#### 权限要求
- `contents: write` - 创建分支
- `issues: write` - 添加评论和标签
- `pull-requests: write` - 创建 PR（未来功能）
- `models: read` - AI 功能支持（未来功能）

### 文件结构

```
.github/
├── ISSUE_TEMPLATE/
│   └── software-request.yml          # Issue 模板
├── workflows/
│   └── handle-software-request.yml   # 处理工作流
└── agent-instructions/               # 临时指令文件（不提交）
    └── software-request-*.md
src/
├── components/
│   └── RequestSoftwareDialog.tsx     # 申请对话框组件
└── i18n/locales/
    ├── zh-CN.json                    # 中文翻译
    └── en.json                       # 英文翻译
```

### 常见问题

**Q: 为什么需要手动处理申请？**
A: 完全自动化需要配置 GitHub Copilot Workspace 集成。目前采用半自动化方式，确保每个软件资源都经过人工审核，保证质量。

**Q: 如何配置完全自动化？**
A: 需要集成 GitHub Copilot Workspace API，自动执行搜索、文件创建和 PR 提交。这需要额外的权限和配置。

**Q: 用户申请被拒绝怎么办？**
A: 管理员应在 Issue 中说明拒绝原因，然后关闭 Issue。建议提供替代方案或修改建议。

---

## English

### Feature Overview

The Software Request feature allows users to request new software resources directly through the website. The system automatically creates GitHub Issues and uses GitHub Actions workflows to assist in processing requests.

### User Guide

#### 1. Submit Software Request

1. Visit the website homepage
2. Click the **"Request Software"** button in the top right corner
3. Fill in the dialog form:
   - **Software Name** (required): Name of the software you need
   - **Additional Information** (optional): Version requirements, usage, etc.
4. Click **"Submit Request"** button
5. System opens GitHub Issue creation page (pre-filled content)
6. Confirm the information and submit the Issue on GitHub

#### 2. Track Request Progress

- After submission, check request status in GitHub Issues
- System automatically adds comments with progress updates
- Software appears on website after admin approval

### Admin Processing Guide

#### Automated Workflow

When a user creates an Issue with the `software-request` label, the workflow automatically:

1. Extracts software name and additional info
2. Creates processing branch `software-request-{issue-number}`
3. Generates detailed instruction file (`.github/agent-instructions/software-request-{issue-number}.md`)
4. Adds progress comment to the Issue

#### Manual Processing Steps

1. **Switch to Processing Branch**
   ```bash
   git fetch origin
   git checkout software-request-{issue-number}
   ```

2. **Review Processing Guide**
   - Open `.github/agent-instructions/software-request-{issue-number}.md`
   - Read detailed task requirements and specifications

3. **Search Software Information**
   - Use GitHub Copilot or manually search for official website
   - Confirm software name, download address, main features, etc.

4. **Create Resource Files**

   Create in `down/{software-name}/` directory:
   
   ```
   {software-name}/
   ├── readme.md         # Chinese description
   ├── readme.en.md      # English description
   ├── tags.txt          # Category tags
   └── latest/           # Latest version
       └── link.txt      # Official download link
   ```

5. **Submit Pull Request**
   ```bash
   git add .
   git commit -m "feat: add {software-name}"
   git push origin software-request-{issue-number}
   ```
   
   Then create a PR on GitHub, linking the original Issue (add `Closes #{issue-number}` in PR description)

6. **Review and Merge**
   - Check resource file format and content
   - Confirm accurate descriptions and valid links
   - Merge PR, Issue will auto-close

### Workflow Configuration

Workflow file located at `.github/workflows/handle-software-request.yml`

#### Trigger Conditions
- Issue created or `software-request` label added

#### Main Steps
1. Extract software information
2. Create initial comment
3. Generate processing guide
4. Create processing branch
5. Add manual processing instructions

#### Required Permissions
- `contents: write` - Create branches
- `issues: write` - Add comments and labels
- `pull-requests: write` - Create PRs (future feature)
- `models: read` - AI feature support (future feature)

### File Structure

```
.github/
├── ISSUE_TEMPLATE/
│   └── software-request.yml          # Issue template
├── workflows/
│   └── handle-software-request.yml   # Processing workflow
└── agent-instructions/               # Temporary instruction files (not committed)
    └── software-request-*.md
src/
├── components/
│   └── RequestSoftwareDialog.tsx     # Request dialog component
└── i18n/locales/
    ├── zh-CN.json                    # Chinese translations
    └── en.json                       # English translations
```

### FAQ

**Q: Why is manual processing needed?**
A: Full automation requires GitHub Copilot Workspace integration. The current semi-automated approach ensures every software resource is manually reviewed for quality.

**Q: How to configure full automation?**
A: Requires integration with GitHub Copilot Workspace API to automatically execute search, file creation, and PR submission. This needs additional permissions and configuration.

**Q: What if a user request is rejected?**
A: Admins should explain the rejection reason in the Issue, then close it. Provide alternative solutions or modification suggestions.
