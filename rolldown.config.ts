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

// The e2e helpers, shared with the apps built on this layer (their Playwright tests import the built files)
const BROWSER_HELPERS_FOLDER = "tests/browser/helpers";

function collectAssets(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && !entry.name.endsWith(".ts"))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

// The helpers read their files (the texture image) next to them, in the build too
const helpersAssetsPlugin = {
  name: "helpers-assets",
  buildStart(this: {
    emitFile: (file: { type: "asset"; fileName: string; source: Uint8Array }) => string;
  }): void {
    for (const asset of collectAssets(BROWSER_HELPERS_FOLDER)) {
      this.emitFile({
        type: "asset",
        fileName: path.relative(".", asset).split(path.sep).join("/"),
        source: fs.readFileSync(asset),
      });
    }
  },
};

function isExternal(id: string): boolean {
  // The e2e helpers import each other through the "imports" of package.json: bundled, as relative imports
  if (id.startsWith(".") || path.isAbsolute(id) || id.startsWith("#browser_helpers/")) {
    return false;
  }
  if (id === ownPackageName || id.startsWith(`${ownPackageName}/`)) {
    return false;
  }
  return true;
}

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  input: [
    ...collectTsFiles("server/utils"),
    ...collectTsFiles("shared"),
    ...collectTsFiles(BROWSER_HELPERS_FOLDER),
  ],
  platform: "node",
  external: isExternal,
  plugins: [helpersAssetsPlugin],
  output: {
    dir: ".build",
    format: "esm",
    preserveModules: true,
    preserveModulesRoot: ".",
  },
});
