# Editing the wedding website

Most changes happen in `content/sections/`. Write the prose, save, and rebuild.
The templates and runtime files supply the existing look and postcard animation;
you do not need to understand them to edit text.

## Change a block

| What appears on the page | File |
| --- | --- |
| Home announcement | `content/sections/home.md` |
| RSVP | `content/sections/rsvp.md` |
| Our Story | `content/sections/story.md` |
| Where to Stay | `content/sections/stay.md` |
| Schedule | `content/sections/schedule.md` |
| Registry | `content/sections/registry.md` |
| Travel | `content/sections/travel.md` |
| Q & A | `content/sections/questions.md` |

For example, `rsvp.md` currently contains:

```markdown
---
id: rsvp
title: RSVP
nav: RSVP
eyebrow: "01 / CELEBRATE WITH US"
---

We can’t wait to celebrate together.

<p class="muted">RSVP details will be added here.</p>
```

The small header between `---` lines contains labels. You can change the title
or eyebrow; normally leave the ID, navigation label, and any `panel` setting
alone. The text below the header is the body. Keep a blank line between
paragraphs. Home's body is a single announcement paragraph; the other blocks
can hold longer content.

Use familiar Markdown:

```markdown
A paragraph with **emphasis** and [a link](https://example.com).

### A smaller heading

- First item
- Second item

| Event | Time |
| --- | --- |
| Ceremony | Details to come |
```

Section titles already come from the header, so start body headings at `###`.
Markdown tables scroll inside their panel when wider than a phone.

## Add HTML when useful

HTML can appear directly in the same file:

```html
<p class="muted">A smaller, quieter note.</p>

<details>
  <summary>A question</summary>
  <p>Its answer.</p>
</details>
```

Inside a complete HTML block, write its inner content as HTML too: use
`<strong>bold</strong>` inside a `<div>`, rather than expecting `**bold**` there
to convert. Markdown before and after the HTML block continues to work.
To add a new image, ask the agent to register its web asset; builds check that
local image/link targets exist in the public export.

## Optional smaller files

Create `content/snippets/arrival.md`, containing just body text. Insert this
line in a section:

```jinja
{% include "snippets/arrival.md" %}
```

The fragment becomes part of the section before Markdown rendering. Fragments
can contain Markdown, HTML, or further includes; they do not need a metadata
header. An unused example is in `content/snippets/example.md`.

To display template commands literally in a code example, surround that example
with `{% raw %}` and `{% endraw %}`. Ordinary code examples only need their usual
Markdown fences.

## Shared facts and page order

`content/_data/site.yaml` stores the names, city, wedding date, and browser-title
suffix. Those facts feed the announcement, footer, schedule, metadata, and the
existing Travel sentence. Keep the ISO wedding date quoted:

```yaml
names: [Jacob, Intan]
city: Jakarta
weddingDate: "2027-07-03"
titleSuffix: Limited Postcard Motions
```

`content/page.md` is the upper-level assembly file. Its `sections` list controls
both page order and navigation. The include loop below the list puts each
rendered Markdown block in its existing panel. Normally leave this file alone;
adding a section or changing a layout is a task for the agent. The eight approved
sections remain in their current order.

## Build and review

Run commands from `jacob-intan-wedding/`. Dependencies are installed in this
workspace. On a fresh checkout with Node 24 installed, run `make setup` once
to install the locked dependencies.

```sh
make build
```

Then reload the existing Caddy review page. Saving Markdown alone does not
update HTML until you build. To rebuild automatically while editing:

```sh
make watch
```

Leave it running, save edits, and reload your browser. Stop with Ctrl-C. The
watcher starts no web server. A bad edit prints its file name and an error; the
last successful page remains available. Fix the edit and save again to recover.

The generated `index.html` and `wedding-limited-v5-style.html` remain identical.
Do not edit them by hand: builds replace them from Markdown and templates.
Existing `serve/` symlinks stay in place. Opening generated HTML directly also
works without Node running.

## Export for future hosting

```sh
make export
```

This produces `dist/`, containing only HTML, CSS, JavaScript, and approved web
images. It has real files and works independently of this workspace. Exporting
does not change tracked review HTML or deploy anything.

For a future Cloudflare Pages project, use root `jacob-intan-wedding`, build
command `npm ci --include=dev && npm run export`, output `dist`, and Node 24. Other static hosts
can serve the same folder. RSVP submission remains a separate feature.

The agent's checks are `make check` for stale HTML, `make test-content` for the
content workflow, and `make test-browser` for rendering and motion.
