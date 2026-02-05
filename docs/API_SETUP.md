# API Setup Guide for Software Request Feature

## Overview

The software request feature uses a Cloudflare Pages Function to automatically create GitHub issues when users submit requests through the website.

## Setup Instructions

### 1. Configure GitHub Token

You need to add a GitHub token to your Cloudflare Pages environment variables:

1. Go to your Cloudflare Pages dashboard
2. Select your project (`soft`)
3. Navigate to **Settings** > **Environment variables**
4. Add a new variable:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: Your GitHub Personal Access Token (see below)
   - **Environment**: Production (and Preview if needed)

### 2. Create GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: `Soft Website - Issue Creation`
4. Select the following scopes:
   - `repo` (Full control of private repositories)
     - This includes `public_repo` for public repositories
5. Set expiration as needed (recommend: No expiration for production)
6. Click "Generate token"
7. **Copy the token immediately** (you won't be able to see it again)
8. Add this token to Cloudflare Pages environment variables

### 3. Deploy

After adding the environment variable:

1. Cloudflare Pages will automatically redeploy your site
2. The API endpoint will be available at `/api/submit-request`

### 4. Test

Test the feature by:

1. Visit your website
2. Click "Request Software" button
3. Fill in the form
4. Submit
5. Check that:
   - Success message appears: "申请已收到，正在收录补充中！" (Chinese) or "Request received, collecting information!" (English)
   - A new issue is created in the GitHub repository
   - The GitHub workflow triggers automatically

## API Endpoint

**URL**: `/api/submit-request`

**Method**: `POST`

**Request Body**:
```json
{
  "softwareName": "Visual Studio Code",
  "additionalInfo": "Need latest stable version",
  "language": "zh-CN"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "issueNumber": 123,
  "issueUrl": "https://github.com/gmij/soft/issues/123",
  "message": "申请提交成功！我们的团队会尽快处理。"
}
```

**Response (Error)**:
```json
{
  "error": "Software name is required"
}
```

## Troubleshooting

### Error: "Server configuration error"

**Cause**: `GITHUB_TOKEN` environment variable is not set or is incorrect.

**Solution**: 
1. Verify the token is added to Cloudflare Pages environment variables
2. Ensure the token has the correct permissions (`repo` scope)
3. Redeploy the site after adding the variable

### Error: "Failed to create issue"

**Possible causes**:
1. GitHub token has expired
2. Token doesn't have sufficient permissions
3. GitHub API rate limit exceeded
4. Network connectivity issues

**Solution**:
1. Check token expiration and permissions
2. View Cloudflare Pages Function logs for detailed error messages
3. Ensure the repository name is correct in the API code

### API not found (404)

**Cause**: Cloudflare Pages Functions not deployed correctly.

**Solution**:
1. Ensure the `functions/` directory is at the root of your project
2. Check that the file is named correctly: `functions/api/submit-request.ts`
3. Redeploy the site

## Security Notes

- The GitHub token should be kept secure and never committed to the repository
- The token should have minimal required permissions (only `repo` scope)
- Consider implementing rate limiting if abuse is a concern
- The API includes CORS headers to allow requests from your domain

## Local Development

For local testing with Wrangler:

1. Create a `.dev.vars` file in the root:
   ```
   GITHUB_TOKEN=your_github_token_here
   ```
2. Add `.dev.vars` to `.gitignore` (already included)
3. Run: `npm run dev` or `npx wrangler pages dev dist`

Note: The `.dev.vars` file should NEVER be committed to version control.
