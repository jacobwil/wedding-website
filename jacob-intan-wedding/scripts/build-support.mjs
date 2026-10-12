import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, parseFragment } from "parse5";

export const ROOT = fileURLToPath(new URL("../", import.meta.url));
export const HTML_FILES = ["index.html", "wedding-limited-v5-style.html"];
const RUNTIME_FILES = ["styles.css", "script.js", "background-config.js", "manifest.json", "photos/catalog.js",
  "fonts/GreatVibes-Regular-latin.woff2", "fonts/GreatVibes-OFL.txt",
  "fonts/Syne-Bold-latin.woff2", "fonts/Syne-OFL.txt",
  "fonts/Aboreto-Regular-latin.woff2", "fonts/Aboreto-OFL.txt",
  "fonts/Fraunces-Bold-latin.woff2", "fonts/Fraunces-OFL.txt",
  "fonts/Prata-Regular-latin.woff2", "fonts/Prata-OFL.txt",
  "fonts/PlayfairDisplay-Regular-latin.woff2", "fonts/PlayfairDisplay-OFL.txt",
  "fonts/Poppins-Regular-latin.woff2", "fonts/Poppins-OFL.txt",
  "fonts/ZillaSlab-Regular-latin.woff2", "fonts/ZillaSlab-OFL.txt"];

export function weddingDate(value, weekday = false) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('site.weddingDate must be a quoted ISO date, for example "2027-07-03".');
  }
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid wedding date: ${value}`);
  }
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC", year: "numeric", month: "long", day: "numeric",
    ...(weekday ? { weekday: "long" } : {}),
  }).format(date);
}

export function validateSite(site) {
  if (!Array.isArray(site.names) || site.names.length !== 2 || site.names.some(n => typeof n !== "string" || !n.trim())) {
    throw new Error("content/_data/site.yaml: names must contain two non-empty names.");
  }
  for (const key of ["city", "titleSuffix"]) {
    if (typeof site[key] !== "string" || !site[key].trim()) throw new Error(`site.yaml: missing ${key}.`);
  }
  weddingDate(site.weddingDate);
  return site;
}

export function validateSections(items) {
  const ids = new Set();
  for (const item of items) {
    const { id, panel } = item.data;
    const file = item.inputPath;
    if (typeof id !== "string" || !/^[a-z][a-z0-9-]*$/.test(id)) throw new Error(`${file}: invalid or missing id.`);
    if (ids.has(id)) throw new Error(`${file}: duplicate section id "${id}".`);
    ids.add(id);
    if (!["standard", "home", "story"].includes(panel)) throw new Error(`${file}: unknown panel "${panel}".`);
    for (const field of ["nav", "eyebrow", ...(panel === "home" ? ["discover"] : ["title"])]) {
      if (typeof item.data[field] !== "string" || !item.data[field].trim()) throw new Error(`${file}: missing ${field}.`);
    }
    if ((panel === "home") !== (id === "home")) throw new Error(`${file}: the home panel belongs to id "home".`);
    if (item.data.permalink !== false || item.data.layout !== false) {
      throw new Error(`${file}: sections must inherit permalink: false and layout: false; only page.md publishes a page.`);
    }
  }
  return items;
}

export function sectionById(items, id) {
  const section = items.find(item => item.data.id === id);
  if (!section) throw new Error(`content/page.md: no section with id "${id}". Check content/sections/.`);
  return section;
}

export function heroCopy(html) {
  const elements = parseFragment(html).childNodes.filter(n => n.nodeName !== "#text" || n.value.trim());
  if (elements.length !== 1 || elements[0].tagName !== "p") {
    throw new Error("content/sections/home.md: write one paragraph for the announcement; the other sections support longer content.");
  }
  return html.replace("<p>", '<p class="getting-married">');
}

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes || []) walk(child, visit);
}

export function publicAssets(root = ROOT) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  const photos = JSON.parse(fs.readFileSync(path.join(root, "docs/photo-inventory.json"), "utf8"));
  if (JSON.stringify(photos.selected_ids) !== "[2,6,9,13,18]") throw new Error("Photo export must retain only approved IDs 2, 6, 9, 13, 18.");
  const extra = JSON.parse(fs.readFileSync(path.join(root, "content/_data/publicAssets.json"), "utf8"));
  if (!Array.isArray(extra)) throw new Error("publicAssets.json must be a list of content-images/ file paths.");
  for (const file of extra) {
    if (typeof file !== "string" || !file.startsWith("content-images/")) throw new Error("Additional public assets must be inside content-images/.");
  }
  const files = new Set([
    ...RUNTIME_FILES,
    ...manifest.items.flatMap(item => [item.full.src, item.medium.src, item.thumbnail.src]),
    ...photos.photos.flatMap(item => [item.thumbnail.path, item.display.path]),
    ...extra,
  ]);
  for (const file of files) {
    if (typeof file !== "string" || file.includes("\\") || path.isAbsolute(file) || file.split("/").includes("..")) {
      throw new Error(`Invalid public asset path: ${file}`);
    }
    if (!RUNTIME_FILES.includes(file) && !/^(images|medium|thumbnails|photos\/(display|thumbnails)|content-images)\//.test(file)) {
      throw new Error(`Asset is outside the public image folders: ${file}`);
    }
    const source = path.join(root, file);
    if (!fs.existsSync(source) || !fs.lstatSync(source).isFile()) throw new Error(`Missing public asset or unexpected symlink: ${file}`);
  }
  return [...files].sort();
}

// Check literal includes before rendering so cycles produce a short, useful error.
// Nunjucks handles all rendering; raw blocks keep template examples literal.
export function validateIncludes(root = ROOT) {
  const roots = [path.join(root, "templates"), path.join(root, "content")];
  const files = [];
  const scan = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(file);
      else if (/\.(md|html|njk)$/.test(file)) files.push(file);
    }
  };
  roots.forEach(scan);
  const visited = new Set();
  const inspect = (file, chain = []) => {
    if (chain.includes(file)) throw new Error(`Circular include: ${[...chain, file].map(f => path.relative(root, f)).join(" -> ")}`);
    if (visited.has(file)) return;
    const source = fs.readFileSync(file, "utf8").replace(/\{%\s*raw\s*%\}[\s\S]*?\{%\s*endraw\s*%\}/g, "");
    for (const match of source.matchAll(/\{%-?\s*include\s+(["'])([^"']+)\1\s*-?%\}/g)) {
      const name = match[2];
      if (path.isAbsolute(name) || name.split("/").includes("..")) throw new Error(`${file}: includes must stay inside templates/ or content/.`);
      const target = roots.map(dir => path.join(dir, name)).find(f => fs.existsSync(f) && fs.statSync(f).isFile());
      if (!target) throw new Error(`${path.relative(root, file)}: missing include "${name}".`);
      inspect(target, [...chain, file]);
    }
    visited.add(file);
  };
  files.forEach(file => inspect(file));
}

export function validateHTML(html, assets) {
  const ids = new Set(), references = [], nav = [], scripts = [];
  let main, motion;
  walk(parse(html), node => {
    const attrs = Object.fromEntries((node.attrs || []).map(a => [a.name, a.value]));
    if (node.tagName === "html") motion = attrs["data-motion-set"];
    if (attrs.id) {
      if (ids.has(attrs.id)) throw new Error(`Generated page has duplicate HTML id "${attrs.id}".`);
      ids.add(attrs.id);
      if (attrs.id === "main-content") main = node;
    }
    if (node.tagName === "a" && attrs.class?.split(" ").includes("nav-link")) nav.push(attrs.href);
    if (node.tagName === "script" && attrs.src) scripts.push(attrs.src);
    for (const key of ["src", "href"]) if (attrs[key]) references.push(attrs[key]);
    if (attrs.srcset) references.push(...attrs.srcset.split(",").map(s => s.trim().split(/\s+/)[0]));
    for (const key of ["aria-labelledby", "aria-describedby"]) {
      if (attrs[key]) references.push(...attrs[key].split(/\s+/).map(id => `#${id}`));
    }
  });
  if (motion !== "limited") throw new Error("Generated page must use the limited v5 motion set.");
  const sections = (main?.childNodes || []).filter(n => n.tagName === "section").map(n => `#${n.attrs.find(a => a.name === "id")?.value}`);
  if (nav.length !== 8 || nav[0] !== "#home" || JSON.stringify(nav) !== JSON.stringify(sections)) {
    throw new Error("Navigation and section order must match, beginning with Home. Check page.md.");
  }
  if (JSON.stringify(scripts) !== JSON.stringify(["background-config.js", "photos/catalog.js", "script.js"])) {
    throw new Error("The background configuration, photo catalog, and runtime must retain their script order.");
  }
  const allowed = new Set([...assets, ...HTML_FILES]);
  for (const ref of references) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref)) continue;
    if (ref.startsWith("#")) {
      if (!ids.has(decodeURIComponent(ref.slice(1)))) throw new Error(`Broken anchor or accessibility reference: ${ref}`);
    } else {
      const file = decodeURIComponent(ref.split(/[?#]/)[0]).replace(/^\.\//, "").replace(/^\//, "");
      if (!allowed.has(file)) throw new Error(`Local asset/link is not in the public export: ${ref}`);
    }
  }
}

function atomicWrite(file, content) {
  const temp = `${file}.build-tmp`;
  try {
    fs.writeFileSync(temp, content);
    fs.renameSync(temp, file);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}

export function finishBuild(output, results, assets, mode = "review", root = ROOT) {
  const result = results.find(item => item.url === "/" || item.outputPath?.endsWith("/index.html"));
  if (!result) throw new Error("Eleventy did not produce index.html.");
  if (results.filter(item => item.outputPath).length !== 1) throw new Error("Only page.md may publish HTML; snippets and sections must not produce separate pages.");
  const html = result.content;
  validateHTML(html, assets);
  fs.writeFileSync(path.join(output, HTML_FILES[1]), html);
  if (mode === "check") {
    for (const name of HTML_FILES) {
      if (!fs.existsSync(path.join(root, name)) || fs.readFileSync(path.join(root, name), "utf8") !== html) {
        throw new Error(`${name} is stale. Run make build and commit both generated HTML files.`);
      }
    }
    console.log("PASS: tracked HTML is current and both limited entries match.");
  } else if (mode === "export") {
    const target = path.join(root, "dist"), previous = path.join(root, ".build/export-previous");
    fs.rmSync(previous, { recursive: true, force: true });
    if (fs.existsSync(target)) {
      if (!fs.lstatSync(target).isDirectory()) throw new Error("dist must be a generated directory, not a file or symlink.");
      fs.renameSync(target, previous);
    }
    try { fs.renameSync(output, target); }
    catch (error) {
      if (fs.existsSync(previous)) fs.renameSync(previous, target);
      throw error;
    }
    fs.rmSync(previous, { recursive: true, force: true });
    console.log(`Exported ${assets.length + HTML_FILES.length} public files to dist/.`);
  } else {
    for (const name of HTML_FILES) atomicWrite(path.join(root, name), html);
    console.log("Updated both limited HTML entries. Reload the existing review page.");
  }
}
