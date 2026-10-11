import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import test from "node:test";
import { ROOT, HTML_FILES, publicAssets } from "../scripts/build-support.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wedding-content-test-"));
  const files = ["content", "templates", "scripts", "eleventy.config.js", "package.json", "docs/photo-inventory.json", ...HTML_FILES, ...publicAssets()];
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.cpSync(path.join(ROOT, file), path.join(root, file), { recursive: true });
  }
  fs.symlinkSync(path.join(ROOT, "node_modules"), path.join(root, "node_modules"), "dir");
  return root;
}

function run(root, flag = "", expected = 0) {
  const result = spawnSync(process.execPath, ["scripts/build.mjs", ...flag ? [flag] : []], {
    cwd: root, encoding: "utf8", timeout: 15000,
  });
  assert.equal(result.status, expected, result.stdout + result.stderr);
  return result.stdout + result.stderr;
}

function filesIn(root, prefix = "") {
  return fs.readdirSync(path.join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    const name = path.posix.join(prefix, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Export contains symlink: ${name}`);
    return entry.isDirectory() ? filesIn(root, name) : [name];
  }).sort();
}

test("Markdown authoring, includes, deterministic output, and independent public export", () => {
  const root = fixture();
  try {
    run(root);
    const initial = fs.readFileSync(path.join(root, "index.html"), "utf8");
    run(root);
    assert.equal(fs.readFileSync(path.join(root, "index.html"), "utf8"), initial);
    run(root, "--check");
    run(root, "--export");
    fs.writeFileSync(path.join(root, "dist/stale-internal.txt"), "must disappear");
    run(root, "--export");
    const assets = publicAssets(root);
    assert.deepEqual(filesIn(path.join(root, "dist")), [...assets, ...HTML_FILES].sort());
    for (const file of [...assets, ...HTML_FILES]) {
      assert.deepEqual(fs.readFileSync(path.join(root, "dist", file)), fs.readFileSync(path.join(root, file)), `Export mismatch: ${file}`);
    }

    const rsvp = path.join(root, "content/sections/rsvp.md");
    const original = fs.readFileSync(rsvp, "utf8");
    fs.writeFileSync(path.join(root, "content/snippets/inner.md"), "A **nested fragment**.\n");
    fs.writeFileSync(path.join(root, "content/snippets/outer.md"), '{% include "snippets/inner.md" %}\n');
    fs.writeFileSync(rsvp, original.replace("title: RSVP", 'title: "RSVP <em>title</em>"') + `
### A useful heading

- One item
- Another item with [a link](#travel)

| Event | Time |
| --- | --- |
| Dinner | To come |

<details><summary>Can we bring children?</summary><p>Details to come.</p></details>

{% include "snippets/outer.md" %}

{% raw %}
\`\`\`jinja
{% include "snippets/not-a-real-file.md" %}
\`\`\`
{% endraw %}
`);
    assert.match(run(root, "--check", 1), /is stale/);
    run(root, "--export");
    assert.equal(fs.readFileSync(path.join(root, "index.html"), "utf8"), initial, "Export must not rewrite tracked review HTML");
    run(root);
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    assert.match(html, /<strong>nested fragment<\/strong>/);
    assert.match(html, /<h3>A useful heading<\/h3>/);
    assert.match(html, /<ul>/);
    assert.match(html, /<table>/);
    assert.match(html, /<details><summary>Can we bring children\?/);
    assert.match(html, /RSVP &lt;em&gt;title&lt;\/em&gt;/, "Metadata must be escaped");
    assert.match(html, /not-a-real-file\.md/, "Template examples in raw blocks must stay literal");
    assert.equal(html, fs.readFileSync(path.join(root, HTML_FILES[1]), "utf8"));
    run(root, "--check");

    fs.writeFileSync(path.join(root, "content/_data/site.yaml"), 'names: ["A & B", C]\ncity: "Other City"\nweddingDate: "2028-02-29"\ntitleSuffix: Wedding\n');
    run(root);
    const changed = fs.readFileSync(path.join(root, "index.html"), "utf8");
    assert.match(changed, /A &amp; B/);
    assert.match(changed, /Tuesday, February 29, 2028/);
    assert.match(changed, /See you in Other City/);
    assert.match(changed, /Other City · February 29, 2028/);
    assert.match(changed, /getting married in Other City on February 29, 2028/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("Invalid content leaves both review entries and the previous export intact", () => {
  const root = fixture();
  try {
    run(root);
    run(root, "--export");
    const before = fs.readFileSync(path.join(root, "index.html"));
    const rsvp = path.join(root, "content/sections/rsvp.md"), original = fs.readFileSync(rsvp, "utf8");
    const failures = [
      ['{% include "snippets/missing.md" %}', /rsvp\.md: missing include/],
      ['<div id="rsvp">Duplicate</div>', /duplicate HTML id/],
      ['![Missing image](content-images/missing.webp)', /not in the public export/],
      ['{{ site.missingValue }}', /undefined/],
    ];
    for (const [content, error] of failures) {
      fs.writeFileSync(rsvp, original + "\n" + content + "\n");
      assert.match(run(root, "--export", 1), error);
      for (const file of HTML_FILES) {
        assert.deepEqual(fs.readFileSync(path.join(root, file)), before);
        assert.deepEqual(fs.readFileSync(path.join(root, "dist", file)), before);
      }
    }
    fs.writeFileSync(rsvp, original + '\n{% include "snippets/a.md" %}\n');
    fs.writeFileSync(path.join(root, "content/snippets/a.md"), '{% include "snippets/b.md" %}');
    fs.writeFileSync(path.join(root, "content/snippets/b.md"), '{% include "snippets/a.md" %}');
    assert.match(run(root, "--export", 1), /Circular include:.*a\.md.*b\.md/);
    fs.unlinkSync(path.join(root, "content/snippets/a.md"));
    fs.unlinkSync(path.join(root, "content/snippets/b.md"));
    fs.writeFileSync(rsvp, original.replace("id: rsvp", "id: story"));
    assert.match(run(root, "", 1), /duplicate section id/);
    fs.writeFileSync(rsvp, original.replace("nav: RSVP", "nav: 42"));
    assert.match(run(root, "", 1), /missing nav/);
    fs.writeFileSync(rsvp, original);
    const page = path.join(root, "content/page.md");
    fs.writeFileSync(page, fs.readFileSync(page, "utf8").replace("  - rsvp", "  - missing"));
    assert.match(run(root, "", 1), /no section with id "missing"/);
    fs.writeFileSync(path.join(root, "content/_data/publicAssets.json"), '["originals/photos/private.jpg"]');
    assert.match(run(root, "--export", 1), /inside content-images/);
    assert.deepEqual(fs.readFileSync(path.join(root, "index.html")), before);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

async function until(predicate, label, milliseconds = 12000) {
  const deadline = Date.now() + milliseconds;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${label}`);
}

test("Native watch rebuilds snippets/settings, preserves the last good page, and recovers", { timeout: 35000 }, async () => {
  const root = fixture();
  const rsvp = path.join(root, "content/sections/rsvp.md"), snippet = path.join(root, "content/snippets/live.md");
  fs.appendFileSync(rsvp, '\n{% include "snippets/live.md" %}\n');
  fs.writeFileSync(snippet, "First watched paragraph.\n");
  const process = spawn(globalThis.process.execPath, ["scripts/build.mjs", "--watch"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  let log = "";
  process.stdout.on("data", data => log += data);
  process.stderr.on("data", data => log += data);
  const html = () => fs.readFileSync(path.join(root, "index.html"), "utf8");
  try {
    await until(() => {
      if (process.exitCode !== null || process.signalCode !== null) throw new Error("Watcher exited during startup");
      return log.includes("Watching Markdown") && html().includes("First watched paragraph");
    }, "watch startup");
    fs.writeFileSync(snippet, "Updated **watched paragraph**.\n");
    await until(() => html().includes("Updated <strong>watched paragraph</strong>"), "included Markdown rebuild");
    const good = html();
    fs.writeFileSync(snippet, '{% include "snippets/missing-live.md" %}');
    await until(() => log.includes("missing-live.md"), "watch error");
    assert.equal(html(), good);
    fs.writeFileSync(snippet, "Recovered watched paragraph.\n");
    await until(() => html().includes("Recovered watched paragraph"), "watch recovery");
    const site = path.join(root, "content/_data/site.yaml");
    fs.writeFileSync(site, fs.readFileSync(site, "utf8").replace("city: Jakarta", "city: Watched City"));
    await until(() => html().includes("See you in Watched City"), "shared settings rebuild");
    fs.appendFileSync(rsvp, "\nA watched block edit.\n");
    await until(() => html().includes("A watched block edit."), "section body rebuild");
    const template = path.join(root, "templates/page.njk");
    fs.writeFileSync(template, fs.readFileSync(template, "utf8").replace('<footer class="footer">', '<footer class="footer" data-template-watch="updated">'));
    await until(() => html().includes('data-template-watch="updated"'), "template rebuild");
    assert.equal(html(), fs.readFileSync(path.join(root, HTML_FILES[1]), "utf8"));
    const updates = log.split("Updated both limited HTML entries").length;
    await new Promise(resolve => setTimeout(resolve, 700));
    assert.equal(log.split("Updated both limited HTML entries").length, updates, "Generated files must not trigger a rebuild loop");
  } catch (error) {
    throw new Error(`${error.message}\n${log}`, { cause: error });
  } finally {
    if (process.exitCode === null && process.signalCode === null) {
      const exited = new Promise(resolve => process.once("exit", resolve));
      process.kill("SIGINT");
      await exited;
    }
    fs.rmSync(root, { recursive: true, force: true });
  }
});
