// デザイン検討用の切り替えパネル。URL に ?design を付けると表示され、選択はブラウザに保存される。
import { useEffect, useState } from 'react';

const THEMES = [
  { id: '', label: '現状' },
  { id: 'warm', label: 'ウォーム' },
  { id: 'dark', label: 'ダーク' },
  { id: 'editorial', label: 'エディトリアル' },
];
const DIALOGUES = [
  { id: '', label: '現状' },
  { id: 'a', label: 'A コントラスト' },
  { id: 'b', label: 'B カード' },
  { id: 'c', label: 'C 台本' },
];

const read = (key: string) => {
  try { return localStorage.getItem(key) ?? ''; } catch { return ''; }
};
const write = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
};

export default function DesignSwitcher() {
  const [visible, setVisible] = useState(() => {
    const wantsPanel = window.location.search.includes('design');
    if (wantsPanel) write('design-switcher', '1');
    return wantsPanel || read('design-switcher') === '1';
  });
  const [theme, setTheme] = useState(() => read('design-theme'));
  const [dialogue, setDialogue] = useState(() => read('design-dialogue'));

  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.setAttribute('data-theme', theme); else root.removeAttribute('data-theme');
    write('design-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (dialogue) root.setAttribute('data-dialogue', dialogue); else root.removeAttribute('data-dialogue');
    write('design-dialogue', dialogue);
  }, [dialogue]);

  if (!visible) return null;

  const group = (label: string, items: { id: string; label: string }[], value: string, onChange: (v: string) => void) => (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs text-neutral-500 w-10">{label}</span>
      {items.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={
            'text-xs px-2 py-1 rounded-sm border transition-colors ' +
            (value === item.id
              ? 'bg-neutral-900 text-neutral-50 border-neutral-900'
              : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500')
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur border border-neutral-300 rounded-lg shadow-lg p-3 space-y-2 text-neutral-900">
      {group('テーマ', THEMES, theme, setTheme)}
      {group('対話', DIALOGUES, dialogue, setDialogue)}
      <button
        type="button"
        onClick={() => { write('design-switcher', ''); setVisible(false); }}
        className="text-xs text-neutral-500 hover:text-neutral-800"
      >
        パネルを閉じる
      </button>
    </div>
  );
}
