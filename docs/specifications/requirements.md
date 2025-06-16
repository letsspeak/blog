# docs/specifications/requirements.md

## 1. プロジェクト概要

| 項目     | 内容                                                                              |
| ------ | ------------------------------------------------------------------------------- |
| リポジトリ名 | **blog**                                                                        |
| 配信形態   | AWS S3 + CloudFront                                                             |
| 公開 URL | `https://blog.lsklab.com`（カスタムドメイン）                                            |
| 技術スタック | Markdown（記事） / TypeScript / React + Vite / Tailwind CSS / GitHub Actions        |
| 主要フォルダ | `articles/` : 元記事（Markdown）<br>`src/` : React SPA ソース<br>`dist/` : ビルド成果物（配信対象） |
| ビルド方式  | Node スクリプトで Markdown → HTML & JSON 変換後、Vite build                               |

---

## 2. ディレクトリ構成

```
blog/
├── articles/
│   └── YYYY-MM/
│       └── YYYY-MM-DD-slug.md
├── src/
│   ├── pages/
│   └── main.tsx
├── docs/
│   └── specifications/    # プロジェクト仕様書
├── dist/                  # ← S3 に配信される成果物
│   ├── index.html
│   ├── assets/
│   └── articles/
├── build-articles.ts      # Markdown → HTML/JSON 変換
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## 3. 記事フォーマット

```
---
title: "記事タイトル"
date: "2025-06-15"
tags: [tag1, tag2]
---

本文（Markdown）
```

* **ファイル名規則**: `YYYY-MM-DD-slug.md`
* **配置先**: `articles/YYYY-MM/` ディレクトリ

---

## 4. ビルド & デプロイフロー

1. **ビルド（統合）**

   * `npm run build` で Markdown 変換 + Vite build を一括実行
   * 各記事を HTML 化 → `dist/articles/YYYY-MM/slug.html` へ配置
   * 全記事メタ情報を `src/posts-index.json` に出力
   * React SPA を `dist/` にビルド
2. **GitHub Actions** (`deploy.yml`)

   * トリガー: `main` への push
   * Node セットアップ → ビルド → S3 同期 → CloudFront キャッシュ無効化
3. **AWS インフラ**

   * **S3バケット**: `blog-lsklab-com` で静的ウェブサイトホスティング
   * **CloudFront**: S3 をオリジンとして CDN 配信
   * **Route 53**: `blog.lsklab.com` を CloudFront に向ける A レコード
   * **ACM**: `blog.lsklab.com` 用 SSL/TLS 証明書
4. **キャッシュ戦略**

   * HTML ファイル: 1時間キャッシュ (`max-age=3600`)
   * CSS/JS ファイル: 1年キャッシュ (`max-age=31536000`)

---

## 5. React SPA 要件

| 機能      | 詳細                                                           |
| ------- | ------------------------------------------------------------ |
| ルーティング  | React Router v6<br>`/` : 記事一覧<br>`/posts/:year/:slug` : 記事詳細 |
| 表示      | Tailwind `prose` クラスで Markdown HTML を整形                      |
| データ取得   | `posts-index.json` で一覧取得 / 記事詳細は HTML を fetch                |
| 404     | 未定義ルートは 404 ページ                                              |
| SEO/OGP | `react-helmet-async` で動的 `<title>` とメタタグ                     |
| 検索 (任意) | `Fuse.js` を用いたクライアントサイド全文検索                                  |

---

## 6. 拡張予定・メモ

* **画像・動画**: 大容量ファイルは同一 S3 バケットまたは別途 CDN で配信
* **下書きプレビュー**: PR ごとに別環境デプロイ（検討中）
* **コメント機能**: 今のところ未実装（必要なら GitHub Issues + utterances など検討）

---

## 7. 完了条件

* [x] `blog` リポジトリ作成、上記構成を push
* [ ] AWS S3 バケット `blog-lsklab-com` 作成
* [ ] CloudFront ディストリビューション設定
* [ ] Route 53 A レコード `blog.lsklab.com` 設定
* [ ] ACM SSL/TLS 証明書発行
* [ ] GitHub Secrets 設定（AWS認証情報）
* [ ] 最初の記事 (`articles/2025-06/2025-06-15-hoge-title.md`) 公開
