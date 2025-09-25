#!/bin/bash

echo "🚀 GitHub Pages 快速部署脚本"
echo "================================"

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    read -p "请输入提交信息: " commit_message
    git commit -m "$commit_message"
fi

# 推送到GitHub
echo "📤 推送代码到GitHub..."
git push origin main

echo "✅ 部署完成！"
echo "🌐 网站地址: https://YOUR_USERNAME.github.io/sel-course-generator/"
echo "⏱️ 请等待1-2分钟让GitHub Actions完成构建"
echo "📊 查看构建状态: https://github.com/YOUR_USERNAME/sel-course-generator/actions"