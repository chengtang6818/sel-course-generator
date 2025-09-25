# 🚀 Netlify 安全部署指南

## 方法1：拖拽部署（推荐）

### 步骤1：注册Netlify
1. 访问 https://netlify.com/
2. 注册免费账号（可以用GitHub登录）

### 步骤2：部署应用
1. 在Netlify控制台，点击 "Add new site" → "Deploy manually"
2. 拖拽项目的 `dist` 文件夹到网页上
3. 等待部署完成，获得临时网址（如：https://amazing-app-123.netlify.app）

### 步骤3：配置环境变量（重要！）
1. 进入网站设置 → "Environment variables"
2. 点击 "Add a variable"
3. 添加：
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: `AIzaSyDrutbxVZBxeULLXPf4moBNFiMcCpBHy_0`

### 步骤4：重新部署
1. 返回 "Deploys" 页面
2. 点击 "Trigger deploy" → "Deploy site"
3. 等待部署完成

### 步骤5：自定义域名（可选）
1. 在 "Domain settings" 中可以自定义域名
2. 或者使用免费的 .netlify.app 域名

## 方法2：GitHub自动部署

### 步骤1：上传到GitHub
```bash
git add .
git commit -m "准备Netlify部署"
git push origin main
```

### 步骤2：连接Netlify
1. 在Netlify选择 "New site from Git"
2. 连接GitHub仓库
3. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`

### 步骤3：配置环境变量
同上述步骤3

## 🔒 安全特性

✅ **API Key安全**：使用环境变量，不在代码中暴露
✅ **HTTPS**：Netlify自动提供SSL证书
✅ **CDN**：全球加速访问
✅ **自动部署**：代码更新自动部署

## 📋 检查清单

- [ ] Netlify账号已注册
- [ ] dist文件夹已上传
- [ ] 环境变量已配置
- [ ] 网站可以正常访问
- [ ] API功能正常工作

## 🆘 故障排除

**问题**：API调用失败
**解决**：检查环境变量是否正确设置

**问题**：页面显示空白
**解决**：检查构建是否成功完成

**问题**：样式丢失
**解决**：确保CSS文件正确加载