// oxlint-disable no-console
import fs from "node:fs";
import path from "node:path";

import { rolldown } from "rolldown";

// Server/utils/extension.ts relies on Nitro's "#imports" auto-import alias and cannot run outside a Nitro server, so it is excluded from this build.
const EXCLUDED_FILES = new Set(["server/utils/extension.ts"]);

function collectTsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(entryPath));
    } else if (entry.name.endsWith(".ts") && !EXCLUDED_FILES.has(entryPath)) {
      files.push(entryPath);
    }
  }
  return files;
}

function isExternal(id: string, ownPackageName: string): boolean {
  if (id.startsWith(".") || path.isAbsolute(id)) {
    return false;
  }
  if (id === ownPackageName || id.startsWith(`${ownPackageName}/`)) {
    return false;
  }
  return true;
}

const input = [...collectTsFiles("server/utils"), ...collectTsFiles("shared")];
const ownPackageName = JSON.parse(fs.readFileSync("package.json", "utf8")).name as string;

// oxlint-disable-next-line no-top-level-await
const bundle = await rolldown({
  input,
  platform: "node",
  external: (id: string) => isExternal(id, ownPackageName),
});
// oxlint-disable-next-line no-top-level-await
await bundle.write({
  dir: ".",
  format: "esm",
  preserveModules: true,
  preserveModulesRoot: ".",
});
// oxlint-disable-next-line no-top-level-await
await bundle.close();

console.log(`[build_node_utils] built ${input.length} files from server/utils/ and shared/`);
