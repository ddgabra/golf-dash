import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const roots = ["app", "components", "lib", "tests", "scripts"];
const forbidden = [new RegExp("TO" + "DO without ticket", "i"), /console\.log\(/];
const files = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    if (entry.isFile() && /\.(ts|tsx|mjs|js)$/.test(entry.name)) files.push(path);
  }
}

for (const root of roots) {
  try {
    await walk(root);
  } catch {
    // root may not exist yet
  }
}

const problems = [];
for (const file of files) {
  const text = await readFile(file, "utf8");
  if (file !== "scripts/lint.mjs") {
    const tryImportPattern = /try\s*\{[\s\S]*?\bfrom\s+["']/m;
    if (tryImportPattern.test(text)) {
      problems.push(`${file}: do not wrap imports in try/catch`);
    }
  }
  for (const pattern of forbidden) {
    if (pattern.test(text)) problems.push(`${file}: forbidden pattern ${pattern}`);
  }
}

if (problems.length) {
  process.stderr.write(`${problems.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write(`Lint passed for ${files.length} files.\n`);
