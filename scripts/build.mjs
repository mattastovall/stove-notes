import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content");
const outputDir = path.join(root, "dist");
const basePath = process.env.BASE_PATH || "";

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const notes = [];
await collectMarkdown(contentDir);

for (const note of notes) {
  const outputPath = path.join(outputDir, note.route, "index.html");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, pageTemplate(note.title, note.html, note.route));
}

await fs.writeFile(path.join(outputDir, "styles.css"), stylesCss());
await fs.writeFile(path.join(outputDir, "index.html"), indexTemplate(notes));

async function collectMarkdown(directory) {
  let entries = [];
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectMarkdown(fullPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

    const relativePath = path.relative(contentDir, fullPath);
    const source = await fs.readFile(fullPath, "utf8");
    const { frontmatter, markdown } = splitFrontmatter(source);
    const route = "/" + relativePath
      .replace(/\.md$/i, "")
      .split(path.sep)
      .map((part) => slugify(part))
      .join("/");
    const title = frontmatter.title || firstHeading(markdown) || path.basename(relativePath, ".md");
    notes.push({ title, route, html: marked.parse(markdown) });
  }
  notes.sort((a, b) => a.title.localeCompare(b.title));
}

function splitFrontmatter(source) {
  if (!source.startsWith("---")) return { frontmatter: {}, markdown: source };
  const end = source.indexOf("\n---", 3);
  if (end === -1) return { frontmatter: {}, markdown: source };
  const raw = source.slice(3, end).trim();
  const frontmatter = Object.fromEntries(raw.split("\n").flatMap((line) => {
    const separator = line.indexOf(":");
    return separator === -1 ? [] : [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]];
  }));
  return { frontmatter, markdown: source.slice(end + "\n---".length).replace(/^\n+/, "") };
}

function firstHeading(markdown) {
  return markdown.match(/^#{1,6}\s+(.+)$/m)?.[1]?.trim();
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "note";
}

function pageTemplate(title, html, route) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} · Real Food Group</title>
    <link rel="stylesheet" href="${basePath}/styles.css?v=3">
  </head>
  <body>
    <main class="shell">
      <a class="back" href="${basePath}/">← All notes</a>
      <article>
        <p class="eyebrow">Real Food Group</p>
        <h1>${escapeHtml(title)}</h1>
        ${html}
      </article>
    </main>
  </body>
</html>`;
}

function indexTemplate(items) {
  const links = items.map((item) => `<li><a href="${basePath}${item.route}/">${escapeHtml(item.title)}</a></li>`).join("\n");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Real Food Group Notes</title>
    <link rel="stylesheet" href="${basePath}/styles.css?v=3">
  </head>
  <body>
    <main class="shell landing">
      <p class="eyebrow">Real Food Group</p>
      <h1>Published notes</h1>
      <p class="lede">Writing from the field, the kitchen, and the margins.</p>
      <ul class="note-list">${links || "<li>No notes published yet.</li>"}</ul>
    </main>
  </body>
</html>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function stylesCss() {
  return `
:root { color-scheme: dark; --bg: #151515; --ink: #ededeb; --muted: #a3a3a0; --accent: #ededeb; --line: #393939; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: 15px; line-height: 1.75; }
::selection { background: var(--ink); color: var(--bg); }
.shell { width: min(760px, calc(100% - 40px)); margin: 0 auto; padding: 72px 0 120px; }
.landing { min-height: 100vh; display: grid; align-content: center; }
.eyebrow { color: var(--muted); font: 700 0.7rem/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.18em; text-transform: uppercase; }
h1, h2, h3 { font-family: "Inter Tight", "Arial Narrow", "Helvetica Neue", Arial, sans-serif; font-stretch: condensed; }
h1 { max-width: 720px; margin: 16px 0 22px; font-size: clamp(2.5rem, 8vw, 5.3rem); font-weight: 600; line-height: 0.94; letter-spacing: -0.055em; }
article h1 { font-size: clamp(2.5rem, 7vw, 4.5rem); }
.lede { color: var(--muted); font-size: 1.05rem; }
.back { display: inline-block; margin-bottom: 54px; color: var(--muted); text-decoration: none; }
.back:hover, a:hover { color: var(--ink); }
article p, article ul, article ol, article blockquote { max-width: 680px; }
article h2, article h3 { margin-top: 2.5em; line-height: 1.15; }
article blockquote { margin-left: 0; padding-left: 20px; border-left: 3px solid var(--accent); color: var(--muted); }
article code { color: var(--accent); }
a { color: var(--ink); text-decoration-thickness: 1px; text-underline-offset: 0.16em; }
.note-list { list-style: none; padding: 0; margin-top: 48px; border-top: 1px solid var(--line); }
.note-list li { padding: 18px 0; border-bottom: 1px solid var(--line); }
.note-list a { font-size: 1.3rem; text-decoration: none; }
`;
}
