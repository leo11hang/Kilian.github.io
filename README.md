# AI 导航站 — Jekyll + GitHub Pages

一个专注 AI 软件教程与激活指南的导航站，带可视化后台管理。

## 🚀 快速部署（5步完成）

### 第1步：创建 GitHub 仓库

1. 登录 GitHub，点击右上角 `+` → `New repository`
2. 仓库名填 `ai-nav`（或任意名字）
3. 选择 `Public`（必须是公开仓库才能免费用 Pages）
4. 点击 `Create repository`

### 第2步：上传项目文件

把本项目所有文件上传到仓库根目录。

方法A（网页上传）：点击 `Add file` → `Upload files`，把所有文件拖进去。

方法B（命令行）：
```bash
git clone https://github.com/你的用户名/ai-nav
cp -r jekyll-site/* ai-nav/
cd ai-nav
git add .
git commit -m "初始化网站"
git push
```

### 第3步：修改配置文件

打开 `_config.yml`，修改这几行：

```yaml
url: "https://你的GitHub用户名.github.io"
baseurl: "/ai-nav"   # 改成你的仓库名
activation_site: "https://你的激活站.com"   # ← 重要！改成你的激活站地址
activation_text: "立即购买激活码"
author: "你的名字"
```

打开 `admin/config.yml`，修改第一行：
```yaml
repo: 你的用户名/ai-nav   # ← 改成你的 GitHub 用户名/仓库名
```

### 第4步：开启 GitHub Pages

1. 进入仓库 → `Settings` → `Pages`
2. `Source` 选择 `GitHub Actions`
3. 保存

### 第5步：开启后台登录权限

后台使用 GitHub OAuth 登录，需要注册一个 OAuth App：

1. 进入 GitHub `Settings` → `Developer settings` → `OAuth Apps` → `New OAuth App`
2. 填写：
   - Application name: `ai-nav-cms`
   - Homepage URL: `https://你的用户名.github.io/ai-nav`
   - Callback URL: `https://你的用户名.github.io/ai-nav/`
3. 保存后台地址：`https://你的用户名.github.io/ai-nav/admin/`

---

## ✍️ 如何发文章

1. 打开浏览器，访问：`https://你的用户名.github.io/ai-nav/admin/`
2. 用 GitHub 账号登录
3. 点击「文章管理」→「新建文章」
4. 填写标题、分类、内容，点击「发布」
5. 等待约 1~2 分钟，GitHub Actions 自动构建，文章上线

---

## 📁 项目结构

```
├── _config.yml          # 网站配置（重要！部署前必须修改）
├── _layouts/            # 页面模板
│   ├── default.html     # 全局布局（含导航、引流按钮）
│   └── post.html        # 文章页布局（含顶部/底部引流CTA）
├── _includes/           
│   └── post-card.html   # 文章卡片组件
├── _posts/              # 文章目录（Markdown格式）
│   ├── 2025-04-01-chatgpt-plus-activation-guide.md
│   ├── 2025-03-28-midjourney-beginner-guide.md
│   └── 2025-03-20-claude-pro-review.md
├── assets/css/main.css  # 样式文件
├── admin/               # 后台管理（Decap CMS）
│   ├── index.html
│   └── config.yml       # 后台配置（需修改 repo 地址）
├── .github/workflows/   # 自动部署配置
│   └── deploy.yml
├── index.html           # 首页
├── tutorial.html        # AI教程分类页
├── activation.html      # 激活教程分类页
├── download.html        # 软件下载分类页
├── faq.html             # 常见问题分类页
└── Gemfile              # Ruby依赖
```

---

## ✏️ 手动添加文章（不用后台）

在 `_posts/` 目录新建文件，命名格式：`YYYY-MM-DD-文章标题.md`

文件头部格式：

```markdown
---
layout: post
title: "文章标题"
date: 2025-04-06 10:00:00 +0800
categories: activation   # tutorial / download / activation / faq
tags: [ChatGPT, 激活码]
excerpt: "文章摘要，显示在列表页"
pinned: true             # 是否置顶（删除这行则不置顶）
---

正文内容（支持 Markdown）
```

---

## 🔗 引流配置

引流链接统一在 `_config.yml` 里配置一次，全站自动生效：
- 顶部导航栏「立即购买激活码」按钮
- 文章页顶部橙色 CTA 框
- 文章页底部橙色 CTA 框  
- 右下角悬浮按钮
- 页脚链接

只需修改 `activation_site` 和 `activation_text` 两个字段即可。

---

## 🌐 绑定自定义域名（可选）

1. 在 `_config.yml` 的 `url` 改为你的域名
2. 在仓库根目录新建 `CNAME` 文件，内容填你的域名（如 `www.yoursite.com`）
3. 在域名服务商处添加 CNAME 记录指向 `你的用户名.github.io`
