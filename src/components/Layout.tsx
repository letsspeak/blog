import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            {/* ブログタイトル */}
            <Link
              to="/"
              className="text-xl font-bold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              letsspeak's Tech Blog
            </Link>

            {/* ナビゲーション */}
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className={`font-medium transition-colors ${
                  isHome
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Home
              </Link>
              
              {/* 将来的にAboutページなどを追加する場合 */}
              {/* <Link
                to="/about"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium transition-colors"
              >
                About
              </Link> */}
            </div>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* フッター */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center text-neutral-500 dark:text-neutral-400">
            <p className="text-sm">
              © 2025 letsspeak's Tech Blog. Built with React + Vite, deployed on AWS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}