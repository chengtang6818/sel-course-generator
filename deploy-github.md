# GitHub Pages 部署指南

## 方法1：使用GitHub Pages（推荐）

### 步骤1：上传到GitHub
```bash
# 1. 初始化git仓库（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交代码
git commit -m "Ready for deployment"

# 4. 在GitHub上创建新仓库，然后连接
git remote add origin https://github.com/你的用户名/sel-course-generator.git

# 5. 推送到GitHub
git push -u origin main
```

### 步骤2：配置GitHub Pages
1. 进入你的GitHub仓库
2. 点击Settings
3. 滚动到Pages部分
4. Source选择"GitHub Actions"
5. 创建.github/workflows/deploy.yml文件

### 步骤3：访问你的网站
- 网址：https://你的用户名.github.io/sel-course-generator/
- GitHub会自动构建和部署

## 方法2：使用Netlify（更简单）

1. 访问 https://netlify.com/
2. 注册账号
3. 拖拽 `dist` 文件夹到Netlify
4. 获得一个免费域名，如：https://amazing-site-123.netlify.app/

## 方法3：使用Vercel

1. 访问 https://vercel.com/
2. 导入GitHub仓库
3. 自动部署，获得域名

## 注意事项

⚠️ **API Key安全**：
- 生产环境建议使用环境变量
- 不要将真实API Key提交到公开仓库
- 可以考虑使用后端代理API调用