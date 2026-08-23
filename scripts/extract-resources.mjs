import fs from "node:fs";
import path from "node:path";

const sourcePath = "/home/ubuntu/upload/小帅同学的储物间.html";
const targetPath = "/home/ubuntu/xiaoshuai-navigation/client/src/data/resources.ts";

const decode = (value) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .replace(/小帅同学/g, "Sky")
    .replace(/小帅/g, "Sky")
    .trim();

const html = fs.readFileSync(sourcePath, "utf8");
const lines = html.split(/\r?\n/);
const stack = [];
const resources = [];
const topLevel = [];

for (const line of lines) {
  const folderMatch = line.match(
    /^<details class="indent-level-(\d+)"><summary>[\s\S]*?clickable-title">([^<]+)<\/span><\/summary>/,
  );

  if (folderMatch) {
    const level = Number(folderMatch[1]);
    const title = decode(folderMatch[2]);
    while (stack.length && stack.at(-1).level >= level) stack.pop();
    stack.push({ level, title });
    if (level === 1 && !topLevel.includes(title)) topLevel.push(title);
  }

  const linkMatcher = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  for (const linkMatch of line.matchAll(linkMatcher)) {
    const url = decode(linkMatch[1]);
    const title = decode(linkMatch[2]);
    if (!/^https?:\/\//i.test(url) || !title) continue;
    const status = line.includes("❌") ? "待核验" : line.includes("✅") ? "可用" : "收藏";
    const topCategory = stack.find((item) => item.level === 1)?.title || "其他收藏";
    const section = stack.at(-1)?.title || topCategory;
    resources.push({
      id: `resource-${resources.length + 1}`,
      title,
      url,
      status,
      category: topCategory,
      section,
    });
  }

  const closedCount = (line.match(/<\/details>/g) || []).length;
  for (let index = 0; index < closedCount; index += 1) stack.pop();
}

const categoryCounts = new Map();
for (const resource of resources) {
  categoryCounts.set(resource.category, (categoryCounts.get(resource.category) || 0) + 1);
}

const categories = [
  { id: "all", label: "全部索引", count: resources.length },
  ...topLevel
    .filter((label) => categoryCounts.has(label))
    .map((label) => ({ id: label, label, count: categoryCounts.get(label) })),
];

const header = `/**\n * 由 scripts/extract-resources.mjs 从用户提供的原始单页导出。\n * 仅包含 http(s) 外链与其所在分类，用于新版导航页面的客户端筛选与呈现。\n */\n\n`;
const types = `export type ResourceStatus = "可用" | "待核验" | "收藏";\n\nexport type Resource = {\n  id: string;\n  title: string;\n  url: string;\n  status: ResourceStatus;\n  category: string;\n  section: string;\n};\n\nexport type ResourceCategory = {\n  id: string;\n  label: string;\n  count: number;\n};\n\n`;
const body = `export const resources: Resource[] = ${JSON.stringify(resources, null, 2)};\n\nexport const categories: ResourceCategory[] = ${JSON.stringify(categories, null, 2)};\n`;

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, header + types + body, "utf8");
console.log(`已导出 ${resources.length} 条资源，覆盖 ${categories.length - 1} 个顶层分类。`);
