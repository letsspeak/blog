import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const SRC = "articles";
const DST = "dist/articles";          // プロダクション用
const DEV_DST = "public/articles";    // 開発用
const INDEX = "dist/posts-index.json"; // プロダクション用メタ情報
const DEV_INDEX = "public/posts-index.json"; // 開発用メタ情報

type PostMeta = { title: string; date: string; slug: string; path: string };

const walk = async (dir: string): Promise<string[]> => {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map(e => {
      const res = path.resolve(dir, e.name);
      return e.isDirectory() ? walk(res) : res;
    }));
    return files.flat();
  } catch (error) {
    console.error(`Error walking directory ${dir}:`, error);
    return [];
  }
};

(async () => {
  try {
    const mdFiles = (await walk(SRC)).filter(f => f.endsWith(".md"));
    const index: PostMeta[] = [];

    // 出力ディレクトリの作成（プロダクション用と開発用）
    await fs.mkdir(DST, { recursive: true });
    await fs.mkdir(DEV_DST, { recursive: true });

    for (const file of mdFiles) {
      try {
        const raw = await fs.readFile(file, "utf8");
        const { data, content } = matter(raw);        // YAML front-matter を想定
        const html = marked.parse(content, { async: false }) as string;  // 型アサーションを追加
        const slug = path.basename(file, ".md");
        const outDir = path.join(DST, path.relative(SRC, path.dirname(file)));
        const devOutDir = path.join(DEV_DST, path.relative(SRC, path.dirname(file)));
        
        // 出力ディレクトリの作成（プロダクション用と開発用）
        await fs.mkdir(outDir, { recursive: true });
        await fs.mkdir(devOutDir, { recursive: true });
        
        // HTMLファイルの書き込み（プロダクション用と開発用）
        await fs.writeFile(path.join(outDir, `${slug}.html`), html);
        await fs.writeFile(path.join(devOutDir, `${slug}.html`), html);

        index.push({
          title: data.title ?? slug,
          date: data.date ?? slug.slice(0, 10),
          slug,
          path: `${path.relative(SRC, path.dirname(file))}/${slug}.html`,
        });
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }

    // インデックスファイルの書き込み（プロダクション用とデベロップメント用）
    await fs.writeFile(INDEX, JSON.stringify(index, null, 2));
    await fs.writeFile(DEV_INDEX, JSON.stringify(index, null, 2));
    console.log(`Successfully processed ${mdFiles.length} markdown files`);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
})();
