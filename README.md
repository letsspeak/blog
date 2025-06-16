# letsspeak's Tech Blog

技術ブログサイト - React + TypeScript + Vite で構築され、AWS S3 + CloudFront で配信されています。

🌐 **ライブサイト**: https://blog.lsklab.com

## 🚀 開発・デプロイ

### ローカル開発
```bash
npm install
npm run dev
```

### ビルド
```bash
npm run build
```

### デプロイ
`main`ブランチへのpushで自動的にAWS S3にデプロイされます。

## 📝 記事の書き方

### 記事ファイルの作成
```
articles/YYYY-MM/YYYY-MM-DD-article-title.md
```

### Front Matter
```yaml
---
title: "記事タイトル"
date: "2025-06-15"
tags: [tag1, tag2, tag3]
---
```

## 📸 画像をブログ記事に貼る方法

### 基本的な手順

1. **画像を配置**: `public/images/` フォルダに画像ファイルを配置
2. **Markdownで記述**: 記事内で以下のように記述

```markdown
![画像の説明文](/images/your-image.png)
```

### 使用例

#### 基本的な画像表示
```markdown
![スクリーンショット](/images/screenshot.png)
```

#### サイズ指定が必要な場合
```html
<img src="/images/large-image.jpg" alt="大きな画像" width="500" />
```

#### レスポンシブ画像
```html
<img src="/images/responsive.jpg" alt="レスポンシブ画像" style="max-width: 100%; height: auto;" />
```

### ファイル配置の推奨構造

```
public/
├── images/
│   ├── screenshots/
│   │   └── dashboard-view.png
│   ├── diagrams/
│   │   └── system-architecture.svg
│   └── photos/
│       └── team-photo.jpg
```

### 対応画像形式

- **PNG** - スクリーンショット、透過画像に最適
- **JPEG** - 写真に最適  
- **SVG** - ベクター画像、アイコンに最適
- **WebP** - 高圧縮・高画質（モダンブラウザ対応）

### ファイル名の注意点

- **小文字** + **ハイフン区切り** を推奨
  - ❌ `MyScreenShot.PNG`
  - ✅ `my-screenshot.png`
- **日本語ファイル名は避ける** - URLで問題が起こる可能性
- **スペースは使わない** - アンダースコアかハイフンを使用

## 🛠 技術構成

- **フロントエンド**: React 18 + TypeScript + Vite
- **スタイリング**: Tailwind CSS + Tailwind Typography
- **ルーティング**: React Router v6
- **ビルド**: カスタムMarkdown処理 + Vite
- **デプロイ**: GitHub Actions → AWS S3 + CloudFront
- **ドメイン**: Route 53 + ACM SSL証明書

## 📁 プロジェクト構造

```
├── articles/           # Markdown記事ファイル
├── src/
│   ├── components/     # Reactコンポーネント
│   ├── pages/         # ページコンポーネント
│   └── main.tsx       # エントリーポイント
├── public/
│   └── images/        # 画像ファイル
├── docs/
│   ├── aws/           # AWS設定ファイル
│   └── specifications/ # プロジェクト仕様
├── dist/              # ビルド出力（S3にデプロイ）
└── build-articles.ts  # Markdown→HTML変換スクリプト
```

## 🎨 デザインシステム

- **フォント**: Inter（本文）+ JetBrains Mono（コード）
- **配色**: 目に優しいニュートラルカラーパレット
- **タイポグラフィ**: 技術ブログに最適化された可読性
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応
