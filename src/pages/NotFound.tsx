import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="text-center py-16">
        {/* 404 イラスト */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-neutral-300 mb-4">404</div>
          <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* エラーメッセージ */}
        <div className="max-w-md mx-auto mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            ページが見つかりません
          </h1>
          <p className="text-neutral-600 leading-relaxed">
            お探しのページは存在しないか、移動または削除された可能性があります。
            URLを確認してもう一度お試しください。
          </p>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/"
            className="btn-primary"
          >
            ホームに戻る
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            前のページに戻る
          </button>
        </div>

        {/* 追加情報 */}
        <div className="mt-12 pt-8 border-t border-neutral-200 max-w-lg mx-auto">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            お探しの内容が見つからない場合
          </h2>
          <div className="space-y-2 text-sm text-neutral-600">
            <p>• <Link to="/" className="link">最新の記事一覧</Link>をご確認ください</p>
            <p>• サイト内検索機能は現在開発中です</p>
            <p>• 技術的な問題の場合は、しばらく時間をおいて再度アクセスしてください</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}