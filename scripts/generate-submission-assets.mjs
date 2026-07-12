import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");
const W = 1284;
const H = 2778;

const c = {
  bg: "#eef3ff",
  paper: "#f8fbff",
  ink: "#10182f",
  blue: "#315ce8",
  mint: "#84f2c4",
  pale: "#dce6ff",
};

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function frame(content) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${c.bg}"/>
    <path d="M0 380H1284M0 760H1284M0 1140H1284M0 1520H1284M0 1900H1284M0 2280H1284" stroke="rgba(16,24,47,0.06)" stroke-width="3"/>
    <path d="M214 0V2778M642 0V2778M1070 0V2778" stroke="rgba(16,24,47,0.06)" stroke-width="3"/>
    ${content}
  </svg>`;
}

function heading(title, subtitle) {
  return `
    <text x="76" y="128" font-family="Courier New, monospace" font-size="31" font-weight="900" letter-spacing="7" fill="${c.blue}">LINK LOCKER</text>
    <text x="76" y="240" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    <text x="80" y="308" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="${c.blue}">${esc(subtitle)}</text>
  `;
}

function linkCard(x, y, title, url, source, purpose, note) {
  const lines = wrap(note, 34).slice(0, 5);
  return `
    <rect x="${x}" y="${y}" width="1080" height="1140" rx="28" fill="${c.paper}" stroke="rgba(16,24,47,0.14)" stroke-width="6"/>
    <rect x="${x}" y="${y}" width="1080" height="105" rx="28" fill="${c.ink}"/>
    <circle cx="${x + 56}" cy="${y + 52}" r="16" fill="${c.mint}"/>
    <circle cx="${x + 106}" cy="${y + 52}" r="16" fill="${c.pale}"/>
    <circle cx="${x + 156}" cy="${y + 52}" r="16" fill="${c.blue}"/>
    <text x="${x + 74}" y="${y + 200}" font-family="Courier New, monospace" font-size="24" font-weight="900" letter-spacing="6" fill="${c.blue}">SAVED LINK</text>
    <text x="${x + 74}" y="${y + 320}" font-family="Arial, sans-serif" font-size="66" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    <rect x="${x + 74}" y="${y + 420}" width="932" height="150" rx="22" fill="${c.ink}"/>
    <text x="${x + 110}" y="${y + 478}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.mint}">URL</text>
    <text x="${x + 110}" y="${y + 530}" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="${c.paper}">${esc(url)}</text>
    <rect x="${x + 74}" y="${y + 632}" width="450" height="150" rx="22" fill="${c.pale}"/>
    <text x="${x + 110}" y="${y + 690}" font-family="Courier New, monospace" font-size="20" font-weight="900" fill="${c.blue}">SOURCE</text>
    <text x="${x + 110}" y="${y + 744}" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="${c.ink}">${esc(source)}</text>
    <rect x="${x + 556}" y="${y + 632}" width="450" height="150" rx="22" fill="${c.mint}"/>
    <text x="${x + 592}" y="${y + 690}" font-family="Courier New, monospace" font-size="20" font-weight="900" fill="${c.blue}">PURPOSE</text>
    <text x="${x + 592}" y="${y + 744}" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="${c.ink}">${esc(purpose)}</text>
    <rect x="${x + 74}" y="${y + 840}" width="932" height="210" rx="22" fill="${c.paper}" stroke="rgba(16,24,47,0.14)" stroke-width="4"/>
    <text x="${x + 110}" y="${y + 902}" font-family="Courier New, monospace" font-size="22" font-weight="900" fill="${c.blue}">CONTEXT NOTE</text>
    ${lines.map((line, i) => `<text x="${x + 110}" y="${y + 966 + i * 36}" font-family="Arial, sans-serif" font-size="29" font-weight="820" fill="${c.ink}">${esc(line)}</text>`).join("")}
  `;
}

function feature(x, y, title, body, fill) {
  return `
    <rect x="${x}" y="${y}" width="540" height="220" rx="24" fill="${fill}" stroke="rgba(16,24,47,0.13)" stroke-width="5"/>
    <text x="${x + 34}" y="${y + 78}" font-family="Arial, sans-serif" font-size="39" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    ${wrap(body, 31).slice(0, 3).map((line, i) => `<text x="${x + 34}" y="${y + 132 + i * 34}" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="${c.blue}">${esc(line)}</text>`).join("")}
  `;
}

function screenshot1() {
  return frame(`
    ${heading("Save one link.", "Store URL, source, purpose, wallet, and timestamp on Base.")}
    ${linkCard(102, 430, "Base builder rewards notes", "docs.base.org/apps/growth/rewards", "Base docs", "submit checklist", "Keep this handy before submitting a new app, especially verification, builder code, and reward eligibility notes.")}
    ${feature(82, 1740, "Useful URL", "Keep a link with context, not just a bookmark.", c.paper)}
    ${feature(662, 1740, "Base record", "Wallet and timestamp stay visible by ID.", c.pale)}
  `);
}

function screenshot2() {
  return frame(`
    ${heading("Load any URL.", "Open a saved link card by ID.")}
    ${feature(82, 390, "Link ID", "Reload a public saved reference.", c.mint)}
    ${feature(662, 390, "Purpose", "Remember why the URL mattered.", c.paper)}
    ${linkCard(102, 740, "Mobile wallet QA checklist", "docs.base.org/apps/quickstart/build-app", "quickstart", "pre-launch QA", "Use before shipping: open in Base App, connect wallet, sign, transact, refresh, and recover the result state.")}
  `);
}

function screenshot3() {
  return frame(`
    ${heading("Keep sources tidy.", "A small link locker for docs, examples, and app references.")}
    ${linkCard(102, 430, "Tiny product copy swipe", "base.org/build", "builder page", "copy reference", "Save concise words and examples that explain a Base app without turning the first screen into marketing.")}
    ${feature(82, 1740, "Source memory", "Title, source, purpose, and note.", c.paper)}
    ${feature(662, 1740, "Onchain", "A compact reference card on Base.", c.pale)}
  `);
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${c.bg}"/>
    <rect x="132" y="164" width="760" height="660" rx="70" fill="${c.paper}" stroke="rgba(16,24,47,0.14)" stroke-width="28"/>
    <rect x="132" y="164" width="760" height="128" rx="70" fill="${c.ink}"/>
    <circle cx="222" cy="226" r="24" fill="${c.mint}"/>
    <circle cx="292" cy="226" r="24" fill="${c.pale}"/>
    <circle cx="362" cy="226" r="24" fill="${c.blue}"/>
    <rect x="250" y="418" width="524" height="100" rx="50" fill="${c.ink}"/>
    <rect x="250" y="578" width="260" height="100" rx="35" fill="${c.pale}"/>
    <rect x="548" y="578" width="226" height="100" rx="35" fill="${c.mint}"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${c.bg}"/>
    <text x="94" y="150" font-family="Arial, sans-serif" font-size="116" font-weight="900" fill="${c.ink}">Link Locker</text>
    <text x="102" y="252" font-family="Arial, sans-serif" font-size="43" font-weight="800" fill="${c.blue}">Save useful URLs with context on Base.</text>
    ${feature(96, 390, "URL", "Save the link and source.", c.paper)}
    ${feature(96, 660, "Context", "Remember why it mattered.", c.pale)}
    ${linkCard(770, 90, "Base builder rewards notes", "docs.base.org/apps/growth/rewards", "Base docs", "submit checklist", "Keep this handy before submitting a new app, especially verification, builder code, and reward eligibility notes.")}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2), "utf8");
await writeFile(
  join(outDir, "submission-copy.md"),
  [
    "# Link Locker",
    "",
    "App Name: Link Locker",
    "Tagline: Save useful URLs",
    "Description: Save a useful URL with title, source, purpose, note, wallet, and timestamp on Base.",
    "",
    "Domain: https://link-locker.vercel.app",
    "",
    "Assets:",
    "- app-icon.jpg",
    "- app-thumbnail.jpg",
    "- screenshot-1.png",
    "- screenshot-2.png",
    "- screenshot-3.png",
  ].join("\n"),
  "utf8",
);

for (const file of files) console.log(file);
