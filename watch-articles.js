#!/usr/bin/env node

import { watch } from 'chokidar';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📖 記事ファイルの監視を開始しています...');

// 記事ディレクトリを監視
const watcher = watch('articles/**/*.md', {
  ignored: /(^|[\/\\])\../, // ドットファイルを無視
  persistent: true,
  ignoreInitial: true // 初期スキャンを無視
});

let isBuilding = false;

// 記事をビルドする関数
function buildArticles() {
  if (isBuilding) {
    console.log('⏳ ビルド実行中のため、スキップします...');
    return;
  }

  isBuilding = true;
  console.log('\n🔄 記事の変更を検出しました。再ビルド中...');

  const buildProcess = spawn('npm', ['run', 'build:articles'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  buildProcess.on('close', (code) => {
    isBuilding = false;
    if (code === 0) {
      console.log('✅ 記事のビルドが完了しました！');
      console.log('📖 記事ファイルの変更を監視中...\n');
    } else {
      console.error('❌ 記事のビルドでエラーが発生しました');
    }
  });

  buildProcess.on('error', (error) => {
    isBuilding = false;
    console.error('❌ ビルドプロセスでエラーが発生しました:', error);
  });
}

// ファイル変更イベント
watcher
  .on('add', path => {
    console.log(`📝 新しい記事ファイルが追加されました: ${path}`);
    buildArticles();
  })
  .on('change', path => {
    console.log(`📝 記事ファイルが変更されました: ${path}`);
    buildArticles();
  })
  .on('unlink', path => {
    console.log(`🗑️  記事ファイルが削除されました: ${path}`);
    buildArticles();
  })
  .on('error', error => {
    console.error('❌ ファイル監視エラー:', error);
  });

console.log('📖 記事ファイルの変更を監視中...');
console.log('⚡ Ctrl+C で監視を停止します\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 記事ファイルの監視を停止しています...');
  watcher.close().then(() => {
    console.log('✅ 監視を停止しました');
    process.exit(0);
  });
});