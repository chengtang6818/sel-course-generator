# 🚀 GitHub Pages 安全部署指南

## 第1步：创建GitHub仓库

1. **访问GitHub.com**，登录您的账号
2. **点击"New repository"**创建新仓库
3. **仓库名称**：`sel-course-generator`
4. **设置为Public**（GitHub Pages免费版需要公开仓库）
5. **不要**勾选"Add a README file"

## 第2步：上传项目代码

在项目目录中运行以下命令：

```bash
# 初始化git仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: SEL课程生成器"

# 连接到GitHub仓库（替换为您的用户名）
git remote add origin https://github.com/您的用户名/sel-course-generator.git

# 推送代码
git branch -M main
git push -u origin main
```

## 第3步：配置GitHub Secrets（重要！）

1. **进入仓库设置**：
   - 在GitHub仓库页面，点击"Settings"
   - 在左侧菜单找到"Secrets and variables" → "Actions"

2. **添加API Key Secret**：
   - 点击"New repository secret"
   - Name: `VITE_GEMINI_API_KEY`
   - Secret: `AIzaSyDrutbxVZBxeULLXPf4moBNFiMcCpBHy_0`
   - 点击"Add secret"

## 第4步：启用GitHub Pages

1. **进入仓库设置** → "Pages"
2. **Source选择**："GitHub Actions"
3. **等待自动部署**：推送代码后会自动触发部署

## 第5步：访问您的网站

- **网址格式**：`https://您的用户名.github.io/sel-course-generator/`
- **部署状态**：在"Actions"标签页查看构建进度
- **部署成功**：绿色✅表示成功，红色❌表示失败

## 🔒 安全特性

✅ **API Key保护**：使用GitHub Secrets，不在代码中暴露
✅ **自动部署**：每次推送代码自动更新网站
✅ **版本控制**：完整的代码历史记录
✅ **免费托管**：GitHub Pages免费提供

## 📋 部署检查清单

- [ ] GitHub仓库已创建
- [ ] 代码已推送到main分支
- [ ] GitHub Secrets已配置（VITE_GEMINI_API_KEY）
- [ ] GitHub Pages已启用
- [ ] Actions工作流运行成功
- [ ] 网站可以正常访问

## 🆘 故障排除

### 问题1：Actions失败
- **检查**：Actions标签页的错误信息
- **解决**：确保package.json和依赖正确

### 问题2：网站无法访问
- **检查**：Pages设置是否正确
- **解决**：确保Source设为"GitHub Actions"

### 问题3：API调用失败
- **检查**：GitHub Secrets是否正确配置
- **解决**：重新添加VITE_GEMINI_API_KEY Secret

### 问题4：样式丢失
- **检查**：构建输出是否包含所有资源
- **解决**：确保Vite配置正确

## 🔄 更新网站

要更新网站内容：

```bash
# 修改代码后
git add .
git commit -m "更新功能"
git push origin main
```

**自动部署**：推送代码后，GitHub Actions会自动重新构建和部署网站。

## 🌟 高级配置

### 自定义域名
1. 在仓库根目录添加`CNAME`文件
2. 内容为您的域名：`your-domain.com`
3. 在域名提供商设置CNAME记录

### 环境隔离
- **开发环境**：本地 `.env.local`
- **生产环境**：GitHub Secrets
- **两者独立**：可以使用不同的API Key