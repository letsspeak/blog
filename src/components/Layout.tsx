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
          <div className="flex flex-col items-center space-y-6">
            {/* ソーシャルリンク */}
            <div className="flex items-center space-x-6">
              <a
                href="https://github.com/letsspeak"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">GitHub</span>
              </a>

              <a
                href="https://twitter.com/letsspeak"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
                <span className="text-sm font-medium">Twitter</span>
              </a>

              <a
                href="mailto:letsinfinite@gmail.com"
                className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="Email"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Email</span>
              </a>
            </div>

            {/* コピーライト */}
            <div className="text-center text-neutral-500 space-y-2">
              <p className="text-sm">
                © 2025 letsspeak's Tech Blog. Built with React + Vite, deployed on AWS.
              </p>
              <div className="flex items-center justify-center space-x-1 text-xs">
                <span>Made with</span>
                <a
                  href="https://claude.ai/code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link text-primary-600 hover:text-primary-700 font-medium"
                >
                  Claude Code
                </a>
                <span>•</span>
                <a
                  href="https://github.com/letsspeak/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Source
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}