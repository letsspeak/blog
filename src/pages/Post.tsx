import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";

interface PostMeta {
  title: string;
  date: string;
  tags?: string[];
}

export default function Post() {
  const { year, slug } = useParams();
  const [html, setHtml] = useState("");
  const [meta, setMeta] = useState<PostMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!year || !slug) return;

    // 記事のHTMLとメタデータを並行して取得
    Promise.all([
      fetch(`/articles/${year}/${slug}.html`).then(r => {
        if (!r.ok) throw new Error('記事が見つかりません');
        return r.text();
      }),
      fetch('/posts-index.json').then(r => r.json()).then(posts => {
        const post = posts.find((p: any) => p.slug === slug);
        return post || null;
      })
    ])
    .then(([htmlContent, postMeta]) => {
      setHtml(htmlContent);
      setMeta(postMeta);
      setLoading(false);
      
      // ページタイトルを設定
      if (postMeta?.title) {
        document.title = `${postMeta.title} | letsspeak's Tech Blog`;
      }
    })
    .catch(err => {
      console.error('Failed to load post:', err);
      setError(err.message);
      setLoading(false);
    });

    // クリーンアップ - ページを離れる時にタイトルをリセット
    return () => {
      document.title = "letsspeak's Tech Blog";
    };
  }, [year, slug]);

  // 日付をフォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-neutral-500">
            記事を読み込み中...
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            記事が見つかりません
          </h1>
          <p className="text-neutral-600 mb-8">
            {error}
          </p>
          <Link 
            to="/"
            className="btn-primary"
          >
            ホームに戻る
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* 記事ヘッダー */}
        <header className="mb-8 pb-8 border-b border-neutral-200">
          <nav className="mb-6">
            <Link 
              to="/"
              className="text-neutral-500 hover:text-neutral-700 text-sm font-medium transition-colors"
            >
              ← すべての記事
            </Link>
          </nav>
          
          {meta && (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 leading-tight mb-4">
                {meta.title}
              </h1>
              
              <div className="flex items-center text-neutral-500 text-sm">
                <time dateTime={meta.date} className="font-medium">
                  {formatDate(meta.date)}
                </time>
                
                {meta.tags && meta.tags.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <div className="flex gap-2">
                      {meta.tags.map(tag => (
                        <span 
                          key={tag}
                          className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </header>

        {/* 記事本文 */}
        <article 
          className="prose prose-neutral prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* 記事フッター */}
        <footer className="mt-12 pt-8 border-t border-neutral-200">
          <Link 
            to="/"
            className="btn-secondary"
          >
            ← すべての記事を見る
          </Link>
        </footer>
      </div>
    </Layout>
  );
}
