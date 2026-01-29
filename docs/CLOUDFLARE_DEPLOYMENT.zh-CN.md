# Cloudflare Pages 部署指南

## 问题说明

当前网站在提交软件申请时出现 **404 错误**，这是因为 Cloudflare Pages Function API 端点 `/api/submit-request` 需要配置 GitHub Token 才能正常工作。

## 解决方案

按照以下步骤配置 Cloudflare Pages：

### 步骤 1: 创建 GitHub Personal Access Token

1. 访问 [GitHub Settings](https://github.com/settings/tokens)
2. 点击 **Developer settings** > **Personal access tokens** > **Tokens (classic)**
3. 点击 **Generate new token (classic)**
4. 填写以下信息：
   - **Note (名称)**: `Soft Website - Issue Creation`
   - **Expiration (过期时间)**: 建议选择 **No expiration**（不过期）
   - **Scopes (权限范围)**:
     - ✅ 勾选 `repo` (Full control of private repositories)
       - 这会自动包含 `public_repo` 权限
5. 点击 **Generate token**
6. **立即复制生成的 token**（离开页面后将无法再次查看）

### 步骤 2: 在 Cloudflare Pages 配置环境变量

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 页面
3. 选择你的项目：`soft`
4. 进入 **Settings (设置)** > **Environment variables (环境变量)**
5. 点击 **Add variable (添加变量)**
6. 填写以下信息：
   - **Variable name (变量名)**: `GITHUB_TOKEN`
   - **Value (值)**: 粘贴刚才复制的 GitHub token
   - **Environment (环境)**:
     - ✅ **Production** (生产环境) - 必选
     - ✅ **Preview** (预览环境) - 可选
7. 点击 **Save (保存)**

### 步骤 3: 重新部署网站

配置完成后，Cloudflare Pages 会自动重新部署网站。你也可以手动触发重新部署：

1. 在项目页面，找到最新的部署记录
2. 点击 **Retry deployment (重新部署)**

或者：

1. 推送一个新的 commit 到 main 分支
2. Cloudflare Pages 会自动部署

### 步骤 4: 验证功能

部署完成后，验证功能是否正常：

1. 访问你的网站：https://soft.gmij.win
2. 点击顶部导航栏的 **申请软件** 按钮
3. 填写软件名称（例如：`win10 ltsc`）
4. 填写补充说明（可选）
5. 点击 **继续提交** 按钮
6. 如果看到 **申请已收到，正在收录补充中！** 的成功提示，说明配置成功
7. 可以在 [GitHub Issues](https://github.com/gmij/soft/issues) 页面查看自动创建的 Issue

## 工作原理

```
用户提交表单
    ↓
前端调用 /api/submit-request
    ↓
Cloudflare Pages Function 接收请求
    ↓
验证输入 + 使用 GITHUB_TOKEN 调用 GitHub API
    ↓
创建 GitHub Issue (标签: software-request)
    ↓
返回成功响应给用户
```

## 常见问题

### Q: 提交时仍然显示 404 错误？

**A:** 可能的原因：
1. 环境变量还未生效 - 等待几分钟后重试，或手动重新部署
2. 环境变量配置错误 - 检查变量名是否为 `GITHUB_TOKEN`（区分大小写）
3. Token 权限不足 - 确保 token 有 `repo` 权限

### Q: 提交时显示 "服务器配置错误"？

**A:** 这表示 `GITHUB_TOKEN` 环境变量未设置或为空。请重新检查 Cloudflare Pages 环境变量配置。

### Q: 提交时显示 "创建 Issue 失败"？

**A:** 可能的原因：
1. GitHub token 已过期 - 重新生成 token
2. Token 权限不足 - 确保有 `repo` 权限
3. GitHub API 速率限制 - 稍后重试
4. 网络连接问题 - 检查 Cloudflare 网络状态

### Q: 如何查看详细的错误日志？

**A:** 
1. 在 Cloudflare Pages 项目页面
2. 点击最新的部署
3. 进入 **Functions** 标签页
4. 查看函数调用日志

## 安全说明

⚠️ **重要提示**：

1. **不要将 GitHub Token 提交到代码仓库**
2. Token 应该只在 Cloudflare Pages 环境变量中配置
3. 定期检查 GitHub token 的使用情况
4. 如果 token 泄露，立即在 GitHub 撤销并生成新的 token

## 本地开发测试

如果需要在本地测试 API 功能：

1. 在项目根目录创建 `.dev.vars` 文件：
   ```
   GITHUB_TOKEN=your_github_token_here
   ```

2. 运行 Wrangler 开发服务器：
   ```bash
   npm run build
   npx wrangler pages dev dist
   ```

3. 访问 http://localhost:8788 测试

**注意**：`.dev.vars` 文件已包含在 `.gitignore` 中，不会被提交到仓库。

## 相关文档

- [docs/API_SETUP.md](./API_SETUP.md) - API 设置详细说明（英文）
- [docs/SOFTWARE_REQUEST_FEATURE.md](./SOFTWARE_REQUEST_FEATURE.md) - 功能详细说明
- [docs/AUTOMATED_FLOW.md](./AUTOMATED_FLOW.md) - 自动化流程说明

## 联系支持

如果按照以上步骤操作后仍然无法解决问题，请：

1. 检查 Cloudflare Pages 部署日志
2. 检查浏览器控制台的网络请求详情
3. 在 GitHub 仓库创建 Issue 描述问题
