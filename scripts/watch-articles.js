#!/usr/bin/env node

import { watch } from 'chokidar';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📖 記事ファイルの監視を開始しています...');

// 記事ディレクトリが存在するか確認
const articlesPath = join(__dirname, 'articles');
console.log('📁 監視ディレクトリ:', articlesPath);
console.log('📁 ディレクトリ存在確認:', existsSync(articlesPath));

// 存在するファイルを確認
import { readdirSync, statSync } from 'fs';

function findMarkdownFiles(dir) {
  const files = [];
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...findMarkdownFiles(fullPath));
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error('ディレクトリ読み取りエラー:', err);
  }
  return files;
}

const existingFiles = findMarkdownFiles(articlesPath);
console.log('📄 見つかったMarkdownファイル:', existingFiles);

// シンプルな監視設定
const watcher = watch(articlesPath, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: false,
  usePolling: true,
  interval: 1000,
  depth: 10, // サブディレクトリの深度
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100
  }
});

// 監視準備完了
watcher.on('ready', () => {
  console.log('✅ 監視準備完了');
  console.log('🔍 監視対象:', Object.keys(watcher.getWatched()));
  console.log('📝 記事ファイルを編集すると自動的にビルドされます...\n');
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

// ファイル変更イベント（.mdファイルのみ対象）
watcher
  .on('add', path => {
    if (path.endsWith('.md')) {
      console.log(`\n📝 新しい記事ファイルが追加されました: ${path}`);
      buildArticles();
    }
  })
  .on('change', path => {
    if (path.endsWith('.md')) {
      console.log(`\n📝 記事ファイルが変更されました: ${path}`);
      buildArticles();
    }
  })
  .on('unlink', path => {
    if (path.endsWith('.md')) {
      console.log(`\n🗑️  記事ファイルが削除されました: ${path}`);
      buildArticles();
    }
  })
  .on('addDir', path => {
    console.log(`📁 ディレクトリが追加されました: ${path}`);
  })
  .on('unlinkDir', path => {
    console.log(`📁 ディレクトリが削除されました: ${path}`);
  })
  .on('error', error => {
    console.error('❌ ファイル監視エラー:', error);
  })
  .on('all', (event, path) => {
    console.log(`🔍 イベント: ${event} - ${path}`);
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