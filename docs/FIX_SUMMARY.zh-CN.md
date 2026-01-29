# 问题修复说明

## 问题原因

网站提交软件申请时出现 **404 错误**，原因是：

1. **缺少后端 API**：Cloudflare Pages Function (`functions/api/submit-request.ts`) 在之前的 revert 中被删除
2. **缺少前端组件**：软件申请对话框组件 (`RequestSoftwareDialog.tsx`) 被删除
3. **环境变量未配置**：即使有 API 文件，也需要在 Cloudflare Pages 配置 `GITHUB_TOKEN` 环境变量

## 已完成的修复

### 1. 恢复核心功能文件

✅ **后端 API**
- 恢复 `functions/api/submit-request.ts` - Cloudflare Pages Function
- 修复了原代码中的一个 bug（重复声明 `isEnglish` 变量）

✅ **前端组件**
- 恢复 `src/components/RequestSoftwareDialog.tsx` - 软件申请对话框
- 恢复 `src/components/MainLayout.tsx` - 添加"申请软件"按钮
- 恢复国际化文件 (`zh-CN.json`, `en.json`) - 添加相关翻译

✅ **GitHub 集成**
- 恢复 `.github/ISSUE_TEMPLATE/software-request.yml` - Issue 模板
- 恢复 `.github/workflows/handle-software-request.yml` - 自动化工作流

✅ **文档**
- `docs/API_SETUP.md` - API 配置说明（英文）
- `docs/CLOUDFLARE_DEPLOYMENT.zh-CN.md` - Cloudflare 部署指南（中文）
- `docs/SOFTWARE_REQUEST_FEATURE.md` - 功能详细说明
- `docs/AUTOMATED_FLOW.md` - 自动化流程说明
- 更新 `README.md` - 添加功能说明和部署指南

### 2. 验证构建

✅ 已验证前端构建成功，所有文件正确集成

## 下一步操作（重要）

### 必须配置 Cloudflare Pages 环境变量

**为了让软件申请功能正常工作，你必须在 Cloudflare Pages 配置 GitHub Token：**

#### 快速步骤：

1. **创建 GitHub Token**
   - 访问 https://github.com/settings/tokens
   - 创建 Personal Access Token (classic)
   - 勾选 `repo` 权限
   - 复制生成的 token

2. **配置 Cloudflare Pages**
   - 进入 Cloudflare Dashboard
   - 选择项目 `soft`
   - Settings > Environment variables
   - 添加变量：
     - Name: `GITHUB_TOKEN`
     - Value: (粘贴你的 GitHub token)
     - Environment: Production ✅

3. **重新部署**
   - Cloudflare Pages 会自动重新部署
   - 或手动触发重新部署

#### 详细说明文档：

📖 **中文指南**：[docs/CLOUDFLARE_DEPLOYMENT.zh-CN.md](docs/CLOUDFLARE_DEPLOYMENT.zh-CN.md)

这个文档包含：
- 详细的分步指南（带截图说明）
- 常见问题解答
- 故障排查方法
- 安全注意事项

📖 **英文指南**：[docs/API_SETUP.md](docs/API_SETUP.md)

## 工作原理

```
用户在网站填写表单
        ↓
点击"提交申请"
        ↓
前端调用 /api/submit-request (POST)
        ↓
Cloudflare Pages Function 接收请求
        ↓
使用 GITHUB_TOKEN 调用 GitHub API
        ↓
创建 GitHub Issue（标签: software-request）
        ↓
返回成功响应
        ↓
显示"申请已收到"提示
        ↓
GitHub Actions 自动处理（可选）
```

## 验证修复

配置完成后，请按以下步骤验证：

1. 访问 https://soft.gmij.win
2. 点击顶部的 **申请软件** 按钮
3. 填写软件名称（例如：`Visual Studio Code`）
4. 填写补充说明（可选）
5. 点击 **继续提交**
6. 应该看到成功提示："申请已收到，正在收录补充中！"
7. 在 https://github.com/gmij/soft/issues 查看自动创建的 Issue

## 如果仍然出现 404 错误

请检查：

1. ✅ 是否已在 Cloudflare Pages 添加 `GITHUB_TOKEN` 环境变量
2. ✅ 环境变量是否已应用到 Production 环境
3. ✅ 是否已重新部署（或等待自动部署完成）
4. ✅ 浏览器是否缓存了旧页面（尝试硬刷新：Ctrl+Shift+R 或 Cmd+Shift+R）

## 其他信息

### 本地开发测试

如果需要在本地测试 API：

```bash
# 创建 .dev.vars 文件
echo "GITHUB_TOKEN=your_token_here" > .dev.vars

# 构建前端
npm run build

# 运行 Cloudflare Pages 本地服务器
npx wrangler pages dev dist
```

访问 http://localhost:8788 测试

### 安全提示

⚠️ **重要**：
- 不要将 GitHub Token 提交到代码仓库
- Token 应该只在 Cloudflare Pages 环境变量中配置
- 如果 Token 泄露，立即在 GitHub 撤销并生成新的

## 代码变更总结

### 新增文件

- `functions/api/submit-request.ts` - Cloudflare Pages Function API
- `src/components/RequestSoftwareDialog.tsx` - 软件申请对话框组件
- `.github/ISSUE_TEMPLATE/software-request.yml` - GitHub Issue 模板
- `.github/workflows/handle-software-request.yml` - GitHub Actions 工作流
- `docs/API_SETUP.md` - API 配置文档（英文）
- `docs/CLOUDFLARE_DEPLOYMENT.zh-CN.md` - 部署指南（中文）
- `docs/SOFTWARE_REQUEST_FEATURE.md` - 功能说明文档
- `docs/AUTOMATED_FLOW.md` - 自动化流程文档

### 修改文件

- `src/components/MainLayout.tsx` - 添加"申请软件"按钮
- `src/components/index.ts` - 导出新组件
- `src/i18n/locales/zh-CN.json` - 添加中文翻译
- `src/i18n/locales/en.json` - 添加英文翻译
- `README.md` - 更新功能说明和部署指南

### 修复的 Bug

- 修复 `functions/api/submit-request.ts` 中重复声明 `isEnglish` 变量的问题

## 总结

✅ **已完成**：恢复所有功能代码和文档

⚠️ **需要配置**：在 Cloudflare Pages 添加 `GITHUB_TOKEN` 环境变量

📖 **参考文档**：[docs/CLOUDFLARE_DEPLOYMENT.zh-CN.md](docs/CLOUDFLARE_DEPLOYMENT.zh-CN.md)

---

如有任何问题，请参考文档或创建 Issue。
