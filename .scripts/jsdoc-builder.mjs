/**
 * Maps docs/stealth.md to JSDoc comments in dist/stealth.d.ts
 * so hover shows the markdown docs. Run after `tsc`.
 * Uses regex/string injection (no Babel). Fragile if tsc changes .d.ts format.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_PATH = path.resolve(__dirname, "../docs/stealth.md");
const DTS_PATH = path.resolve(__dirname, "../dist/stealth.d.ts");

const INDENT = "    ";

function parseMarkdownSections(content) {
  const map = {};
  const sections = content.split(/\n(?=## )/);
  for (const section of sections) {
    const m = section.match(/^## (.+?)\n([\s\S]*)/);
    if (!m) continue;
    const name = m[1].trim();
    const body = m[2].trim();
    const firstPara = body.split(/\n(?:### |```|## )/m)[0].trim();
    const codeMatch = body.match(/```(?:ts|typescript)?\n([\s\S]*?)```/);

    const lines = [""];
    lines.push(...firstPara.split(/\n/));
    lines.push("");
    if (codeMatch) {
      lines.push("@example");
      lines.push(...codeMatch[1].trim().split(/\n/));
      lines.push("@endexample");
      lines.push("");
    }

    const block =
      INDENT +
      "/**\n" +
      lines.map((l) => INDENT + " * " + l).join("\n") +
      "\n" +
      INDENT +
      " */\n";
    map[name] = block;
  }
  return map;
}

/**
 * Injects JSDoc before a declaration. Replaces in order from last to first
 * so indices stay valid. Skips if the line is already immediately after a JSDoc block.
 */
function run() {
  const md = fs.readFileSync(DOCS_PATH, "utf8");
  const entityToBlock = parseMarkdownSections(md);

  // (entity key in docs/stealth.md, pattern to find in .d.ts) - order: last in file first
  const injections = [
    ["close", "close: ()"],
    ["context", "context: ()"],
    ["newPage", "newPage: ()"],
    ["page", "page: ()"],
    ["click", "click: ("],
    ["fill", "fill: ("],
    ["Constructor", "constructor(options: StealthOptions);"],
  ];

  let dts = fs.readFileSync(DTS_PATH, "utf8");

  for (const [entity, pattern] of injections) {
    const block = entityToBlock[entity];
    if (!block) continue;

    const search = "\n" + INDENT + pattern;
    const idx = dts.indexOf(search);
    if (idx === -1) continue;

    // Avoid double-injection: if we're right after a JSDoc block, skip
    const before = dts.slice(Math.max(0, idx - 80), idx);
    if (before.trimEnd().endsWith("*/")) continue;

    const repl = "\n" + block + INDENT + pattern;
    dts = dts.slice(0, idx) + repl + dts.slice(idx + search.length);
  }

  fs.writeFileSync(DTS_PATH, dts);
}

run();

