# 完全自动化的软件申请流程说明

## 流程概览

```
┌─────────────┐
│   用户访问   │
│   网站首页   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 点击"申请软件"│
│    按钮      │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  弹出对话框填写表单   │
│  - 软件名称（必填）   │
│  - 补充说明（可选）   │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│ 点击"提交申请"│
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│ 前端调用 Cloudflare      │
│ Pages Function API       │
│ POST /api/submit-request │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ API 调用 GitHub API      │
│ 自动创建 Issue           │
│ 标签: software-request   │
└──────┬───────────────────┘
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
┌─────────────┐            ┌─────────────────┐
│ 用户看到提示 │            │ GitHub Actions  │
│"申请已收到， │            │ 工作流自动触发   │
│正在收录补充中"│            └─────────┬───────┘
└─────────────┘                      │
                                     ▼
                          ┌──────────────────┐
                          │ 创建处理分支      │
                          │ 生成指导文件      │
                          │ 添加进度评论      │
                          └─────────┬────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ 管理员使用 Copilot│
                          │ 搜索和创建资源    │
                          └─────────┬────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ 创建 Pull Request│
                          └─────────┬────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ 审核并合并        │
                          └─────────┬────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ 软件自动出现在    │
                          │ 网站上            │
                          └──────────────────┘
```

## 关键特性

### ✅ 用户体验

1. **无需离开网站** - 用户在网站上完成所有操作
2. **即时反馈** - 提交后立即看到"申请已收到，正在收录补充中！"
3. **无需 GitHub 账号** - 普通用户无需注册 GitHub
4. **透明进度** - 可通过 GitHub Issues 跟踪处理进度

### ✅ 技术实现

1. **Cloudflare Pages Function** - 无服务器 API 端点
2. **GitHub API 集成** - 自动创建和管理 Issues
3. **GitHub Actions 工作流** - 自动化处理流程
4. **双语支持** - 完整的中英文国际化

### ✅ 安全性

1. **环境变量** - GitHub Token 安全存储在 Cloudflare
2. **输入验证** - 前后端双重验证
3. **错误处理** - 完善的错误处理和用户提示
4. **CORS 配置** - 正确的跨域资源共享设置

## 对比旧流程

### 旧流程（手动）

```
用户填表 → 跳转到 GitHub → 用户手动创建 Issue → 用户点击提交
```

**问题**：
- 需要用户有 GitHub 账号
- 用户需要手动操作
- 可能被浏览器弹窗拦截
- 用户体验不佳

### 新流程（自动）

```
用户填表 → 点击提交 → 立即看到确认 → 后台自动创建 Issue
```

**优势**：
- ✅ 无需 GitHub 账号
- ✅ 完全自动化
- ✅ 不会被拦截
- ✅ 用户体验优秀

## 配置要求

### 必需配置

在 Cloudflare Pages 中设置环境变量：

```
名称: GITHUB_TOKEN
值: ghp_xxxxxxxxxxxxxxxxxxxx (你的 GitHub Personal Access Token)
权限: repo (完整的仓库访问权限)
```

### 创建 Token 步骤

1. 访问 GitHub Settings → Developer settings → Personal access tokens
2. 生成新 Token（经典版）
3. 选择 `repo` 权限范围
4. 复制 Token（只显示一次！）
5. 在 Cloudflare Pages 环境变量中添加

详细说明：[docs/API_SETUP.md](API_SETUP.md)

## 测试清单

部署后测试：

- [ ] 访问网站，点击"申请软件"按钮
- [ ] 填写软件名称和补充说明
- [ ] 点击"提交申请"
- [ ] 验证看到成功消息："申请已收到，正在收录补充中！"
- [ ] 检查 GitHub 上是否自动创建了 Issue
- [ ] 验证 Issue 有正确的标签 `software-request`
- [ ] 确认 GitHub Actions 工作流已触发
- [ ] 查看 Issue 中的自动评论

## 故障排查

如果提交失败，检查：

1. **Cloudflare 环境变量** - 确保 GITHUB_TOKEN 已正确设置
2. **Token 权限** - 确保有 `repo` 权限
3. **Token 有效期** - 确保未过期
4. **网络连接** - Cloudflare → GitHub API 连接正常
5. **查看日志** - Cloudflare Pages Function 日志

## 文件结构

```
项目根目录/
├── functions/                    # Cloudflare Pages Functions
│   └── api/
│       └── submit-request.ts     # API 端点（自动创建 Issue）
├── src/
│   ├── components/
│   │   └── RequestSoftwareDialog.tsx  # 前端对话框组件
│   └── i18n/locales/
│       ├── zh-CN.json            # 中文翻译
│       └── en.json               # 英文翻译
├── docs/
│   ├── API_SETUP.md              # API 配置指南
│   ├── SOFTWARE_REQUEST_FEATURE.md  # 功能文档
│   └── AUTOMATED_FLOW.md         # 本文件
└── .github/
    └── workflows/
        └── handle-software-request.yml  # 自动化工作流
```

## 成功标志

当看到以下情况时，说明系统工作正常：

✅ 用户提交表单后立即看到成功消息
✅ GitHub 上自动创建了 Issue
✅ Issue 包含正确的信息和标签
✅ GitHub Actions 工作流开始运行
✅ Issue 中出现自动添加的进度评论
✅ 用户无需任何手动操作
