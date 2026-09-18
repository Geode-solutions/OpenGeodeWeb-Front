import fs from "node:fs";
import path from "node:path";

import { defineConfig } from "rolldown";

import package_json from "./package.json" with { type: "json" };

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

const ownPackageName = package_json.name;

function isExternal(id: string): boolean {
  if (id.startsWith(".") || path.isAbsolute(id)) {
    return false;
  }
  if (id === ownPackageName || id.startsWith(`${ownPackageName}/`)) {
    return false;
  }
  return true;
}

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  input: [...collectTsFiles("server/utils"), ...collectTsFiles("shared")],
  platform: "node",
  external: isExternal,
  output: {
    dir: ".",
    format: "esm",
    preserveModules: true,
    preserveModulesRoot: ".",
  },
});
