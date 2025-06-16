import React from 'react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  // Twitter シェア URL
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  
  // はてなブックマーク シェア URL
  const hatenaShareUrl = `https://b.hatena.ne.jp/entry/${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-neutral-600">シェア:</span>
      
      <div className="flex items-center space-x-3">
        {/* Twitter シェアボタン */}
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          aria-label="Twitterでシェア"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
          </svg>
          <span>Twitter</span>
        </a>

        {/* はてなブックマーク シェアボタン */}
        <a
          href={hatenaShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          aria-label="はてなブックマークに追加"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm8 3a1 1 0 011 1v6a1 1 0 11-2 0V8.414l-1.293 1.293a1 1 0 01-1.414-1.414L10.586 6H9a1 1 0 110-2h3zm-4 8a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
          <span>はてブ</span>
        </a>

        {/* URL コピーボタン */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(url).then(() => {
              // 簡単なフィードバック（必要に応じてトーストライブラリなどを使用）
              const button = document.activeElement as HTMLButtonElement;
              const originalText = button.textContent;
              button.textContent = 'コピー済み!';
              setTimeout(() => {
                button.textContent = originalText;
              }, 2000);
            });
          }}
          className="flex items-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          aria-label="URLをコピー"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>コピー</span>
        </button>
      </div>
    </div>
  );
}