/**
 * ChatGPT の共有リンクから対話を取り込み、記事 Markdown を生成する。
 *
 *   npx tsx scripts/import-chatgpt-share.ts --url https://chatgpt.com/share/<id> \
 *     --date 2026-08-09 --slug ai-era-engineering-skill [--title "..."] [--tags a,b] [--out drafts/articles]
 *
 * 出力: articles/YYYY-MM/YYYY-MM-DD-<slug>.md（--out で出力先ディレクトリを変更できる）
 * 本文は発言を削らず、ChatGPT の表示用トークン（引用マーカー等）だけを除去する。
 */
import { promises as fs } from "fs";
import path from "path";

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

// ---- ChatGPT 表示用トークンの除去（発言内容は変えない） ----
export function cleanText(s: string): string {
  return s
    .replace(/[\s\S]*?/g, "")                   // 引用マーカー（私用領域文字で囲まれる）
    .replace(/cite(?:turn\d+(?:search|news|view|image)\d+)+/g, "")
    .replace(/entity\["[^"]*","([^"]*)"[^\]]*\]/g, "$1")      // entity["company","TSMC",...] → TSMC
    .replace(/^.*image_group\{[\s\S]*?\}\s*$/gm, "")          // 画像検索の指示
    .replace(/iturn\d+image\d+/g, "")                         // 画像参照
    .replace(/\?utm_source=chatgpt\.com/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  const res = await fetch(args.url, {
    headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" },
  });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const html = await res.text();
  const chunks = [...html.matchAll(/streamController\.enqueue\("((?:[^"\\]|\\.)*)"\)/g)].map(m => JSON.parse(`"${m[1]}"`) as string);
  const rootChunk = chunks.find(c => c.startsWith("["));
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
