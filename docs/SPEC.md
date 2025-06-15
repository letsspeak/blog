# ブログサイト仕様書

## 概要
このブログサイトは、React + TypeScript + Viteで構築されたSPA（Single Page Application）です。  
記事はMarkdownで管理され、ビルド時にHTMLに変換されます。

## 技術スタック
- **フロントエンド**: React + TypeScript + Vite
- **スタイリング**: Tailwind CSS
- **ルーティング**: React Router
- **記事管理**: Markdown
- **ビルドツール**: Vite
- **デプロイ**: Docker + nginx on ECS

## ディレクトリ構成
```
blog/
├── src/                # ソースコード
│   ├── components/     # Reactコンポーネント
│   ├── pages/         # ページコンポーネント
│   ├── styles/        # スタイルシート
│   └── main.tsx       # エントリーポイント
├── public/            # 静的ファイル
├── docs/              # ビルド出力先
├── scripts/           # ビルドスクリプト
└── package.json       # 依存関係
```

## ビルドプロセス
1. `npm run build:articles`: MarkdownファイルをHTMLに変換
2. `npm run build`: ViteでSPAをビルド
3. ビルド成果物は `docs/` ディレクトリに出力

## デプロイ
- Dockerコンテナ内でnginxを使用し、ECSでホスティング
- ビルド成果物（`docs/`）をコンテナ内のnginxのルートディレクトリに配置
- カスタムドメイン（blog.lsklab.com）を使用

## 開発フロー
1. ローカルで開発・テスト
2. 変更をコミット・プッシュ
3. GitHub Actionsでビルド
4. ビルド成果物をECSにデプロイ

## 注意事項
- カスタムドメインの設定は手動で管理
- ビルド成果物は `docs/` ディレクトリに出力されるため、このディレクトリはGitで管理 