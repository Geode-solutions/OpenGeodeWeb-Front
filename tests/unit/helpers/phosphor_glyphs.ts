// Node imports
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const SOURCE_EXTENSIONS = new Set([".ts", ".vue"]);
// An icon name: ph-<name>, not the weight class ph-fill
const ICON_NAME = /\bph-(?!fill\b)[a-z0-9]+(?:-[a-z0-9]+)*/gu;

// Every glyph of the Phosphor regular and fill weights
const PHOSPHOR_GLYPHS = new Set(
  [
    fs.readFileSync(require.resolve("@phosphor-icons/web/regular"), "utf8"),
    fs.readFileSync(require.resolve("@phosphor-icons/web/fill"), "utf8"),
  ].flatMap((css) =>
    [...css.matchAll(/\.(?<glyph>ph-[a-z0-9-]+):before/gu)].map((match) => match.groups?.glyph),
  ),
);

function iconNames(value: string): string[] {
  return value.match(ICON_NAME) ?? [];
}

function sourceFiles(folder: string): string[] {
  return fs.readdirSync(folder, { recursive: true, encoding: "utf8" }).flatMap((file) => {
    const filePath = path.join(folder, file);
    if (!SOURCE_EXTENSIONS.has(path.extname(file)) || !fs.statSync(filePath).isFile()) {
      return [];
    }
    return [filePath];
  });
}

// The icon names written in the sources of the folders that are no Phosphor glyph, as "<file>: <name>"
function missingPhosphorIcons(root: string, folders: string[]): string[] {
  return folders
    .flatMap((folder) => sourceFiles(path.join(root, folder)))
    .flatMap((file) =>
      iconNames(fs.readFileSync(file, "utf8"))
        .filter((name) => !PHOSPHOR_GLYPHS.has(name))
        .map((name) => `${path.relative(root, file)}: ${name}`),
    );
}

export { PHOSPHOR_GLYPHS, iconNames, missingPhosphorIcons };
