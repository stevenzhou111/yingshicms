# CloudMovie 部署指南

## Cloudflare Pages 部署

### 方式一：直接上传（最快）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create**
3. 选择 **Pages** → **Direct Upload**
4. 上传 `dist` 目录中的所有文件
5. 完成部署，获得 `https://xxx.pages.dev` 域名

### 方式二：Git 集成

1. 将项目推送到 GitHub/GitLab
2. Cloudflare Pages → **Create project** → 连接仓库
3. 构建配置：
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 每次 push 自动部署

### 方式三：Wrangler CLI

```bash
# 安装 wrangler
npm install -g wrangler

# 登录
wrangler login

# 部署
cd ingshi
npm run build
wrangler pages deploy dist --project-name=cloudmovie
```

## 功能特性

- ✅ 多源聚合搜索
- ✅ 苹果CMS API 对接
- ✅ 播放历史记录
- ✅ 收藏功能
- ✅ 搜索历史
- ✅ 横向滚动卡片
- ✅ 浅色主题 UI
- ✅ 响应式布局
- ✅ 移动端底部导航
- ✅ 设置抽屉面板
- ✅ 数据导出/导入

## 技术栈

- Vue 3 + Vite
- Vue Router
- 响应式 CSS
- localStorage 持久化

## 项目结构

```
src/
├── main.js          # 入口
├── App.vue          # 根布局
├── router.js        # 路由
├── store/index.js   # 状态管理
├── api/cms.js       # API 请求
├── utils/helpers.js # 工具函数
├── assets/main.css  # 样式
└── views/           # 页面组件
    ├── Home.vue     # 首页
    ├── Search.vue   # 搜索
    ├── Detail.vue   # 详情
    ├── Play.vue     # 播放
    ├── Favorites.vue # 收藏
    ├── History.vue  # 历史
    └── Sources.vue  # 源管理
```

## 性能指标

- 构建产物: 228KB
- JS Bundle: 115KB
- CSS: 20KB
- 首屏加载: <1s (Cloudflare CDN)

## 注意事项

1. 代理 API 需要服务端支持（开发环境用 server.cjs）
2. 生产环境需要配置 API 代理
3. 数据存储在浏览器 localStorage
4. 支持 JSONP 和 fetch 双通道
