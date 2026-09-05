# Chu Yuewei — Portfolio

Lusion 风格的个人资料页。React 19 + Vite 7 + Tailwind CSS 4 + Framer Motion + Lenis。

## 本地开发

```bash
npm install
npm run dev
```

## 部署到 Netlify

**方式一：Git 自动部署（推荐）**

1. 把项目推送到 GitHub / GitLab
2. Netlify → Add new site → Import an existing project
3. 构建配置会自动读取 `netlify.toml`：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 点击 Deploy

**方式二：CLI 手动部署**

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

## 自定义内容

- 个人信息 / 文案：`src/components/Hero.tsx`、`About.tsx`、`Contact.tsx`
- 作品：`src/components/Work.tsx` 中的 `projects` 数组
- 技能：`src/components/Skills.tsx`
- 经历：`src/components/Journey.tsx`
- 图片：`public/images/`
- 主题色：`src/index.css` 中的 `@theme` 变量（`--color-accent` 等）
