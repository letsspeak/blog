import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            {/* ブログタイトル */}
            <Link
              to="/"
              className="text-xl font-bold text-neutral-900 hover:text-primary-600 transition-colors"
            >
              letsspeak's Tech Blog
            </Link>

            {/* ナビゲーション */}
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className={`font-medium transition-colors ${
                  isHome
                    ? 'text-primary-600'
                    : 'text-neutral-600 hover:text-neutral-900'
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
      <footer className="border-t border-neutral-200 mt-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center text-neutral-500">
            <p className="text-sm">
              © 2025 letsspeak's Tech Blog. Built with React + Vite, deployed on AWS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}