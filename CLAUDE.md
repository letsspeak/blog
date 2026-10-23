# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build:articles` - Convert Markdown articles to HTML
- `npm run build` - Full build (Vite build + articles, output to `dist/`)
- `npm run preview` - Preview built site
- `npm run lint` - Run ESLint (max 0 warnings enforced)
- `npm run typecheck` - Type-check with tsc (no emit)
- `npm run format` - Format code with Prettier
- `npx tsx scripts/import-chatgpt-share.ts --url <share url> --date YYYY-MM-DD --slug <slug> [--title ...] [--tags a,b]` - Import a ChatGPT shared conversation as a dialogue article

### Testing
No test framework is configured in this project.

## Architecture

This is a static blog built as a React SPA with a custom Markdown processing pipeline for S3 + CloudFront deployment.

### Content Flow
1. Markdown articles in `articles/YYYY-MM/` directories
2. `scripts/build-articles.ts` processes Markdown → HTML and generates metadata
3. React app fetches article list from `posts-index.json`
4. Individual articles loaded as pre-built HTML from `articles/`

### Key Components
- **Build Pipeline**: Custom TypeScript script (`scripts/build-articles.ts`) converts Markdown using `gray-matter` + `marked`
- **File Watching**: Development script (`scripts/watch-articles.js`) monitors article changes for auto-rebuild
- **Routing**: React Router handles `/` (home) and `/posts/:year/:slug` (articles)
- **Content Strategy**: Hybrid approach - metadata as JSON, content as static HTML
- **Deployment**: Builds to `dist/` directory, deployed to S3 + CloudFront with custom domain (blog.lsklab.com)

### File Conventions
- Articles: `articles/YYYY-MM/YYYY-MM-DD-slug.md` format
- Front-matter: YAML with `title`, `date`, `tags` fields
- URLs: `/posts/:year/:slug` pattern
- `drafts/` is gitignored: private notes, raw dialogue exports, review memos. Never move its contents into `docs/` or `articles/` without checking for personal data (the repo is public)

### Dialogue Articles (AI との対話ログ)
- Front-matter `type: dialogue` plus `source` (share URL), `model`, `dialogue_date`. Optional `speakers` map overrides the default avatars/names (`user` = letsspeak, `assistant` = チャッピー, images in `public/images/characters/`)
- Body: free Markdown (summary / 読みどころ) followed by turns written as `::: user` … `:::` / `::: assistant` … `:::`. `scripts/build-articles.ts` renders each turn as a speaker bubble
- Policy: the turns are published verbatim. Only ChatGPT display tokens are stripped and third-party identifying details are anonymized; no summarizing or rewording of turns. The Markdown source is also copied to `dist/articles/.../slug.md` so the raw log stays readable by people and machines

### Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS with Typography plugin
- React Router v6
- Node.js >=20 required

### Important Notes
- Build process unified in single `build` command (articles + Vite)
- Content served from `dist/` directory
- Styling uses Tailwind `prose` class for article content
- ESLint enforces zero warnings policy
- Deployment via GitHub Actions to S3 + CloudFront

### Required GitHub Secrets
- `AWS_ACCESS_KEY_ID`: AWS access key for deployment user
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for deployment user
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID for cache invalidation