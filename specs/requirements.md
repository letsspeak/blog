# specs/requirements.md

## 1. プロジェクト概要

| 項目     | 内容                                                                              |
| ------ | ------------------------------------------------------------------------------- |
| リポジトリ名 | **blog**                                                                        |
| 配信形態   | GitHub Pages（`main` ブランチ `/docs` フォルダ）                                          |
| 公開 URL | `https://letsspeak.github.io/blog/`（既定）<br>`https://blog.lsklab.com`（カスタムドメイン）  |
| 技術スタック | Markdown（記事） / TypeScript / React + Vite / Tailwind CSS / GitHub Actions        |
| 主要フォルダ | `articles/` : 元記事（Markdown）<br>`src/` : React SPA ソース<br>`docs/` : ビルド成果物（配信対象） |
| ビルド方式  | Node スクリプトで Markdown → HTML & JSON 変換後、Vite build                               |

---

## 2. ディレクトリ構成

```
blog/
├── articles/
│   └── YYYY-MM/
│       └── YYYY-MM-DD-slug.md
├── src/
│   ├── components/
│   ├── pages/
│   └── main.tsx
├── public/
├── docs/                  # ← GitHub Pages が配信
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

1. **Markdown 変換**

   * `build-articles.ts` を実行
   * 各記事を HTML 化 → `docs/articles/YYYY-MM/slug.html` へ配置
   * 全記事メタ情報を `src/posts-index.json` に出力
2. **React SPA ビルド**

   * `npm run build` で Vite build (`dist/`)
   * 生成物を `docs/` へ移動
3. **GitHub Actions** (`deploy.yml`)

   * トリガー: `main` への push
   * Node セットアップ → 変換 → ビルド → `docs/` 更新
   * Pages 設定: `main` / `/docs`
4. **DNS & TLS**

   * Route 53 で `blog.lsklab.com` → `letsspeak.github.io` へ CNAME
   * GitHub Pages 側でカスタムドメイン + HTTPS 有効化

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

* **画像・動画**: 大容量ファイルは S3/CloudFront へ配置し `<img>` / `<video>` で参照
* **下書きプレビュー**: PR ごとに Pages Preview を利用
* **コメント機能**: 今のところ未実装（必要なら GitHub Issues + utterances など検討）

---

## 7. 完了条件

* [ ] `blog` リポジトリ作成、上記構成を push
* [ ] GitHub Pages 設定 (`main` / `docs`)
* [ ] Route 53 に CNAME `blog.lsklab.com`
* [ ] HTTPS 証明書発行確認
* [ ] 最初の記事 (`articles/2025-06/2025-06-15-hoge-title.md`) 公開
