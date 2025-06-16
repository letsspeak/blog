import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

type Meta = { title: string; date: string; slug: string; path: string };

export default function Home() {
  const [posts, setPosts] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/posts-index.json")
      .then(r => r.json())
      .then(data => {
        // 日付順でソート（新しい記事が上に）
        const sortedPosts = data.sort((a: Meta, b: Meta) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setPosts(sortedPosts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load posts:', err);
        setLoading(false);
      });
  }, []);

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
          <div className="text-neutral-500 dark:text-neutral-400">
            記事を読み込み中...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ヒーローセクション */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Tech Blog
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
          技術的な学びや開発の記録を残していく場所です。
          主にWeb開発、React、TypeScript、AWSなどについて書いています。
        </p>
      </div>

      {/* 記事一覧 */}
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
          最新の記事
        </h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">
              まだ記事がありません。
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <article 
                key={post.slug}
                className="card p-6 hover:shadow-md transition-shadow duration-200"
              >
                <Link 
                  to={`/posts/${post.date.slice(0,7)}/${post.slug}`}
                  className="block group"
                >
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                    {post.title}
                  </h3>
                  
                  <time 
                    dateTime={post.date}
                    className="text-sm text-neutral-500 dark:text-neutral-400 font-medium"
                  >
                    {formatDate(post.date)}
                  </time>
                  
                  <div className="mt-3 text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                    記事を読む →
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
