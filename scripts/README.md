# Scripts

このディレクトリには、ブログの開発・ビルド用スクリプトが含まれています。

## ファイル一覧

### `build-articles.ts`
Markdownファイルを HTML に変換するビルドスクリプト。

**機能:**
- `articles/` ディレクトリ内の `.md` ファイルを検索
- YAML front-matter を解析してメタデータを取得
- Markdown を HTML に変換
- `dist/articles/` と `public/articles/` に HTML ファイルを出力
- `posts-index.json` にメタデータ一覧を出力

**実行方法:**
```bash
npm run build:articles
```

### `watch-articles.js`
記事ファイルの変更を監視し、自動的に再ビルドするスクリプト。

**機能:**
- `articles/` ディレクトリを監視
- `.md` ファイルの変更・追加・削除を検出
- 変更時に `build-articles.ts` を自動実行
- ポーリングモードで確実な監視

**実行方法:**
```bash
npm run dev:watch
```

## 技術詳細

### 使用ライブラリ
- **gray-matter**: YAML front-matter の解析
- **marked**: Markdown → HTML 変換
- **chokidar**: ファイル監視
- **ts-node**: TypeScript の実行

### 出力先
- **開発環境**: `public/` ディレクトリ（Vite開発サーバー用）
- **プロダクション**: `dist/` ディレクトリ（S3デプロイ用）