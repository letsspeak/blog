/**
 * ChatGPT の共有リンクから対話を取り込み、記事 Markdown を生成する。
 *
 *   npx tsx scripts/import-chatgpt-share.ts --url https://chatgpt.com/share/<id> \
 *     --date 2026-08-09 --slug ai-era-engineering-skill [--title "..."] [--tags a,b] [--out drafts/articles] [--html saved.html]
 *
 * 出力: articles/YYYY-MM/YYYY-MM-DD-<slug>.md（--out で出力先ディレクトリを変更できる）
 * 本文は発言を削らず、ChatGPT の表示用トークン（引用マーカー等）だけを除去する。
 * 取得は fetch → curl の順で試す（Node の fetch だと SSR ペイロード無しの殻ページが返ることがある）。
 * --html でブラウザから保存した HTML を直接渡すこともできる。
 */
import { promises as fs } from "fs";
import path from "path";
import { execFileSync } from "child_process";

type Args = Record<string, string>;
const args: Args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i].replace(/^--/, "");
  args[k] = process.argv[i + 1] ?? "";
}
if (!args.url || !args.date || !args.slug) {
  console.error("usage: --url <share url> --date YYYY-MM-DD --slug <slug> [--title ...] [--tags a,b]");
  process.exit(1);
}

// ---- turbo-stream (react-router の SSR ペイロード) のデコード ----
type Flat = unknown[];
function decodeTurbo(arr: Flat): unknown {
  const memo = new Map<number, unknown>();
  const special: Record<number, unknown> = { [-1]: undefined, [-2]: NaN, [-3]: Infinity, [-4]: -Infinity, [-5]: -0, [-6]: null };
  const dec = (i: number): unknown => {
    if (i < 0) return special[i];
    if (memo.has(i)) return memo.get(i);
    const v = arr[i];
    if (Array.isArray(v)) {
      if (v.length === 2 && typeof v[0] === "string" && "DPEBNURXK".includes(v[0]) && typeof v[1] === "number") {
        memo.set(i, null);
        const out = { __typed: v[0], value: dec(v[1]) };
        memo.set(i, out);
        return out;
      }
      const out: unknown[] = [];
      memo.set(i, out);
      for (const x of v) out.push(dec(x as number));
      return out;
    }
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      memo.set(i, out);
      for (const [k, val] of Object.entries(v as Record<string, number>)) {
        const key = k.startsWith("_") ? String(arr[Number(k.slice(1))]) : k;
        out[key] = dec(val);
      }
      return out;
    }
    memo.set(i, v);
    return v;
  };
  return dec(0);
}

function findAll(obj: unknown, key: string, acc: unknown[] = []): unknown[] {
  if (Array.isArray(obj)) obj.forEach(v => findAll(v, key, acc));
  else if (obj && typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    if (key in o) acc.push(o[key]);
    Object.values(o).forEach(v => findAll(v, key, acc));
  }
  return acc;
}

// ---- ChatGPT の UI ウィジェット（JSX 風タグ）を素の Markdown に戻す ----
function chartToTable(json: string): string {
  try {
    const c = JSON.parse(json) as { xKey?: string; series?: { dataKey: string; label?: string }[]; data?: Record<string, unknown>[]; meta?: { footer?: string } };
    if (!c.xKey || !c.series?.length || !c.data?.length) return "（グラフ）";
    const head = `| ${c.xKey} | ${c.series.map(sr => sr.label ?? sr.dataKey).join(" | ")} |`;
    const sep = `|${"---|".repeat(c.series.length + 1)}`;
    const rows = c.data.map(d => `| ${String(d[c.xKey!])} | ${c.series!.map(sr => String(d[sr.dataKey])).join(" | ")} |`);
    const footer = c.meta?.footer ? `\n\n${c.meta.footer}` : "";
    return `（グラフを表で表示）\n\n${[head, sep, ...rows].join("\n")}${footer}`;
  } catch {
    return "（グラフ）";
  }
}

function stripWidgets(s: string): string {
  s = s
    .replace(/<Chart content=\{(\{[\s\S]*?\})\}\s*\/>/g, (_m, j: string) => chartToTable(j))
    .replace(/<Cite\b[^>]*\/>/g, "")
    .replace(/<Link\b[^>]*url="([^"]*)"[^>]*title="([^"]*)"[^>]*\/>/g, "[$2]($1)")
    .replace(/<Link\b[^>]*title="([^"]*)"[^>]*url="([^"]*)"[^>]*\/>/g, "[$1]($2)")
    .replace(/<Entity\b[^>]*value="([^"]*)"[^>]*\/>/g, "$1")
    .replace(/^.*<AsyncImageGroup\b[\s\S]*?\/>\s*$/gm, "")
    .replace(/!\[([^\]]*)\]\(sandbox:[^)]*\)/g, "（画像「$1」は共有ページに含まれないため表示できません）")
    .replace(/^.*\[[^\]]*\]\(sandbox:[^)]*\)\s*$/gm, "")
    .replace(/<text\b[^>]*>([\s\S]*?)<\/text>/g, "$1")
    .replace(/<badge\b[^>]*>([\s\S]*?)<\/badge>/g, "$1")
    .replace(/<list-item\b[^>]*>([\s\S]*?)<\/list-item>/g, "- $1")
    .replace(/<icon\b[^>]*name="arrow-down"[^>]*\/>/g, "↓")
    .replace(/<icon\b[^>]*\/>/g, "");
  // <box>/<row>/<list> のレイアウトタグは外し、内側のインデントを落とす（Markdown のコードブロック扱いを防ぐ）
  const out: string[] = [];
  let depth = 0;
  for (const raw of s.split("\n")) {
    const opens = (raw.match(/<box\b/g) ?? []).length;
    const closes = (raw.match(/<\/box>/g) ?? []).length;
    const inside = depth > 0 || opens > 0;
    depth = Math.max(0, depth + opens - closes);
    out.push(inside ? raw.replace(/<\/?(box|row|list)\b[^>]*>/g, "").trim() : raw);
  }
  return out.join("\n");
}

// ---- ChatGPT 表示用トークンの除去（発言内容は変えない） ----
export function cleanText(s: string): string {
  return stripWidgets(s)
    .replace(/[\s\S]*?/g, "")                   // 引用マーカー（私用領域文字で囲まれる）
    .replace(/cite(?:turn\d+(?:search|news|view|image)\d+)+/g, "")
    .replace(/entity\["[^"]*","([^"]*)"[^\]]*\]/g, "$1")      // entity["company","TSMC",...] → TSMC
    .replace(/^.*image_group\{[\s\S]*?\}\s*$/gm, "")          // 画像検索の指示
    .replace(/iturn\d+image\d+/g, "")                         // 画像参照
    .replace(/\?utm_source=chatgpt\.com/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

function findRootChunk(html: string): string | undefined {
  const chunks = [...html.matchAll(/streamController\.enqueue\("((?:[^"\\]|\\.)*)"\)/g)].map(m => JSON.parse(`"${m[1]}"`) as string);
  return chunks.find(c => c.startsWith("["));
}

async function fetchShareHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const html = await res.text();
  if (findRootChunk(html)) return html;
  console.error("fetch returned a page without the SSR payload; retrying with curl");
  return execFileSync("curl", ["-sL", "-A", UA, url], { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
}

async function main() {
  const html = args.html ? await fs.readFile(args.html, "utf-8") : await fetchShareHtml(args.url);
  const rootChunk = findRootChunk(html);
  if (!rootChunk) throw new Error("payload not found");
  const root = decodeTurbo(JSON.parse(rootChunk));

  const mapping = findAll(root, "mapping").find(m => m && typeof m === "object") as Record<string, any> | undefined;
  if (!mapping) throw new Error("conversation mapping not found");
  const shareTitle = (findAll(root, "title").find(t => typeof t === "string") as string) ?? "";

  const roots = Object.keys(mapping).filter(k => !mapping[k]?.parent);
  const order: string[] = [];
  const walk = (k: string) => { order.push(k); for (const c of mapping[k]?.children ?? []) if (mapping[c]) walk(c); };
  roots.forEach(walk);

  const turns: { role: "user" | "assistant"; text: string }[] = [];
  let firstTime: number | undefined;
  for (const k of order) {
    const msg = mapping[k]?.message;
    if (!msg || typeof msg !== "object") continue;
    const role = msg.author?.role;
    if (role !== "user" && role !== "assistant") continue;
    const content = msg.content ?? {};
    if (content.content_type && !["text", "multimodal_text"].includes(content.content_type)) continue;
    if (msg.metadata?.is_visually_hidden_from_conversation) continue;
    const parts: unknown[] = content.parts ?? [];
    const text = parts.map(p => (typeof p === "string" ? p : "（画像）")).join("\n").trim();
    if (!text) continue;
    if (!firstTime && typeof msg.create_time === "number") firstTime = msg.create_time;
    turns.push({ role, text: cleanText(text) });
  }
  if (!turns.length) throw new Error("no turns");

  const title = args.title || shareTitle.replace(/^ChatGPT - /, "");
  const tags = (args.tags ? args.tags.split(",") : ["ai-dialogue", "chatgpt"]).map(t => t.trim()).filter(Boolean);
  const dialogueDate = firstTime ? new Date(firstTime * 1000).toISOString().slice(0, 10) : args.date;

  const fm = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `date: ${JSON.stringify(args.date)}`,
    `tags: [${tags.join(", ")}]`,
    "type: dialogue",
    `source: ${JSON.stringify(args.url)}`,
    "model: ChatGPT",
    `dialogue_date: ${JSON.stringify(dialogueDate)}`,
    "---",
    "",
    "<!-- ここに要約と読みどころを書く（本文の発言は編集しない） -->",
    "",
    "",
  ].join("\n");

  const body = turns.map(t => `::: ${t.role}\n\n${t.text}\n\n:::`).join("\n\n");
  const dir = args.out ? args.out : path.join("articles", args.date.slice(0, 7));
  await fs.mkdir(dir, { recursive: true });
  const out = path.join(dir, `${args.date}-${args.slug}.md`);
  await fs.writeFile(out, fm + body + "\n");
  console.log(`${out}  (${turns.length} turns, title: ${title}, dialogue_date: ${dialogueDate})`);
}

main().catch(e => { console.error(e); process.exit(1); });
