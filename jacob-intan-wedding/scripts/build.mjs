import Eleventy from "@11ty/eleventy";
import { ROOT } from "./build-support.mjs";

const flags = process.argv.slice(2);
if (flags.length > 1 || flags.some(flag => !["--watch", "--export", "--check"].includes(flag))) {
  console.error("Usage: node scripts/build.mjs [--watch | --export | --check]");
  process.exit(1);
}
process.chdir(ROOT);
process.env.WEDDING_BUILD_MODE = flags.includes("--export") ? "export" : flags.includes("--check") ? "check" : "review";
const builder = new Eleventy("content", ".build/site", { configPath: "eleventy.config.js" });
try {
  if (flags.includes("--watch")) {
    builder.setRunMode("watch");
    await builder.init();
    await builder.watch();
    console.log("Watching Markdown, settings, snippets, and templates. Save, then reload the existing Caddy page.");
  } else {
    await builder.write();
  }
} catch (error) {
  console.error(error.message);
  let cause = error.cause || error.originalError;
  while (cause) {
    console.error(cause.message);
    cause = cause.cause || cause.originalError;
  }
  process.exitCode = 1;
}
