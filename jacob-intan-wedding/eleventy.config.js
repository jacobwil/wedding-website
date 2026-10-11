import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import MarkdownIt from "markdown-it";
import nunjucks from "nunjucks";
import {
  ROOT, finishBuild, heroCopy, publicAssets, sectionById, validateIncludes,
  validateSections, validateSite, weddingDate,
} from "./scripts/build-support.mjs";

export default function (eleventy) {
  const assets = publicAssets();
  const environment = new nunjucks.Environment(
    new nunjucks.FileSystemLoader([path.join(ROOT, "templates"), path.join(ROOT, "content")], { noCache: true }),
    { autoescape: true, throwOnUndefined: true },
  );
  environment.addFilter("sectionById", sectionById);
  environment.addFilter("weddingDate", weddingDate);
  environment.addFilter("heroCopy", heroCopy);
  eleventy.setLibrary("njk", environment);
  eleventy.setLibrary("md", new MarkdownIt({ html: true, linkify: false, typographer: false }));
  eleventy.addDataExtension("yaml", contents => loadYaml(contents));
  eleventy.addCollection("weddingSections", api => {
    const items = api.getFilteredByTag("weddingSection");
    if (!items.length) throw new Error("No Markdown sections found in content/sections/.");
    validateSite(items[0].data.site);
    return validateSections(items);
  });
  eleventy.ignores.add("content/snippets/**");
  eleventy.addWatchTarget("content/snippets/");
  eleventy.addWatchTarget("templates/");
  // Node's watcher works in this workspace's macOS sandbox; the optional
  // native FSEvents addon can initialize there without delivering changes.
  eleventy.setChokidarConfig({ useFsEvents: false });
  eleventy.addWatchTarget("manifest.json", { resetConfig: true });
  eleventy.addWatchTarget("docs/photo-inventory.json", { resetConfig: true });
  eleventy.addWatchTarget("content/_data/publicAssets.json", { resetConfig: true });
  for (const asset of assets) eleventy.addPassthroughCopy({ [asset]: asset });
  eleventy.on("eleventy.before", ({ directories }) => {
    validateIncludes();
    const output = path.resolve(directories.output);
    if (output !== path.join(ROOT, ".build/site")) throw new Error("Builds must stage in .build/site; use make export to publish dist/.");
    fs.rmSync(output, { recursive: true, force: true });
  });
  eleventy.on("eleventy.after", ({ directories, results }) => {
    finishBuild(path.resolve(directories.output), results, assets, process.env.WEDDING_BUILD_MODE || "review");
  });
  return {
    dir: { input: "content", includes: "../templates", output: ".build/site" },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
