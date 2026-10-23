import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const SRC = "articles";
const DST = "dist/articles";          // プロダクション用
const DEV_DST = "public/articles";    // 開発用
const INDEX = "dist/posts-index.json"; // プロダクション用メタ情報
const DEV_INDEX = "public/posts-index.json"; // 開発用メタ情報

type PostMeta = {
  title: string;
  date: string;
  slug: string;
  path: string;
  tags?: string[];
  type?: "dialogue";
  source?: string;
  model?: string;
  dialogueDate?: string;
  raw?: string; // 元ログ（Markdown）のパス
};

// 対話記事の発言者。front-matter の speakers で上書きできる
const DEFAULT_SPEAKERS: Record<string, { name: string; avatar: string }> = {
  user: { name: "letsspeak", avatar: "/images/characters/letsspeak.png" },
  assistant: { name: "チャッピー", avatar: "/images/characters/chappy.svg" },
};

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

/**
 * CommonMark の強調は「**…」**み」のように閉じ記号の直前が約物で直後に文字が続くと
 * 認識されない（日本語で頻発）。コード以外の部分で **…** を <strong> に直接変換して補う。
 */
function fixCjkStrong(src: string): string {
  // フェンスコードブロックとインラインコードは触らない
  return src
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/)
    .map((seg, i) => {
      if (i % 2 === 1) return seg;
      return seg
        .split(/(`[^`\n]*`)/)
        .map((part, j) => (j % 2 === 1 ? part : part.replace(/\*\*(?=\S)([^*\n]+?)(?<=\S)\*\*/g, "<strong>$1</strong>")))
        .join("");
    })
    .join("");
}

const md = (s: string) => marked.parse(fixCjkStrong(s), { async: false }) as string;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/**
 * `::: user` / `::: assistant` 〜 `:::` のブロックを発言者付きの HTML に変換する。
 * ブロック外は通常の Markdown として扱う。
 */
function renderDialogue(content: string, speakers: Record<string, { name: string; avatar: string }>): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let buf: string[] = [];
  let role: string | null = null;
  const flush = () => {
    const text = buf.join("\n").trim();
    buf = [];
    if (!text) return;
    if (role) {
      const sp = speakers[role] ?? { name: role, avatar: "" };
      out.push(
        `<section class="dialogue-turn dialogue-turn--${role}">` +
          `<div class="dialogue-turn__speaker">` +
            (sp.avatar ? `<img class="dialogue-turn__avatar" src="${esc(sp.avatar)}" alt="" width="40" height="40">` : "") +
            `<span class="dialogue-turn__name">${esc(sp.name)}</span>` +
          `</div>` +
          `<div class="dialogue-turn__body">${md(text)}</div>` +
        `</section>`
      );
    } else {
      out.push(md(text));
    }
  };
  for (const line of lines) {
    const open = line.match(/^:::\s*(user|assistant)\s*$/);
    if (open) { flush(); role = open[1]; continue; }
    if (/^:::\s*$/.test(line) && role) { flush(); role = null; continue; }
    buf.push(line);
  }
  flush();
  return out.join("\n");
}

(async () => {
  try {
    const mdFiles = (await walk(SRC)).filter(f => f.endsWith(".md"));
    const index: PostMeta[] = [];

    await fs.mkdir(DST, { recursive: true });
    await fs.mkdir(DEV_DST, { recursive: true });

    for (const file of mdFiles) {
      try {
        const raw = await fs.readFile(file, "utf8");
        const { data, content } = matter(raw);
        const isDialogue = data.type === "dialogue";
        const speakers = { ...DEFAULT_SPEAKERS, ...(data.speakers ?? {}) };
        const html = isDialogue ? renderDialogue(content, speakers) : md(content);
        const slug = path.basename(file, ".md");
        const rel = path.relative(SRC, path.dirname(file));
        const outDir = path.join(DST, rel);
        const devOutDir = path.join(DEV_DST, rel);

        await fs.mkdir(outDir, { recursive: true });
        await fs.mkdir(devOutDir, { recursive: true });
        await fs.writeFile(path.join(outDir, `${slug}.html`), html);
        await fs.writeFile(path.join(devOutDir, `${slug}.html`), html);

        const meta: PostMeta = {
          title: data.title ?? slug,
          date: data.date ?? slug.slice(0, 10),
          slug,
          path: `${rel}/${slug}.html`,
          ...(Array.isArray(data.tags) && data.tags.length > 0 ? { tags: data.tags.map(String) } : {}),
        };

        if (isDialogue) {
          // 元ログを Markdown のまま配信する（人にも機械にも読める形で残す）
          await fs.writeFile(path.join(outDir, `${slug}.md`), raw);
          await fs.writeFile(path.join(devOutDir, `${slug}.md`), raw);
          Object.assign(meta, {
            type: "dialogue",
            ...(data.source ? { source: String(data.source) } : {}),
            ...(data.model ? { model: String(data.model) } : {}),
            ...(data.dialogue_date ? { dialogueDate: String(data.dialogue_date) } : {}),
            raw: `${rel}/${slug}.md`,
          });
        }
        index.push(meta);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }

    await fs.writeFile(INDEX, JSON.stringify(index, null, 2));
    await fs.writeFile(DEV_INDEX, JSON.stringify(index, null, 2));
    console.log(`Successfully processed ${mdFiles.length} markdown files`);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
})();
