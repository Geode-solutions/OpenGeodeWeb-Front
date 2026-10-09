type UploadFile = File & { relativePath?: string; isConfigured?: boolean; displayName?: string };

// Path of the file inside the back upload folder: keeps the folder tree of a dropped directory.
function uploadPath(file: UploadFile): string {
  for (const candidate of [file.relativePath, file.webkitRelativePath]) {
    if (candidate !== undefined && candidate !== "") {
      return candidate;
    }
  }
  return file.name;
}

function uploadDirectory(path: string): string {
  const index = path.lastIndexOf("/");
  return index === -1 ? "" : path.slice(0, index);
}

function joinUploadPath(directory: string, path: string): string {
  return directory === "" ? path : `${directory}/${path}`;
}

function fileExtension(path: string): string {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const index = name.lastIndexOf(".");
  return index === -1 ? "" : name.slice(index + 1).toLowerCase();
}

type Alignment =
  | { status: "aligned"; paths: (string | undefined)[] }
  | { status: "not_found" }
  | { status: "ambiguous" };

function countPrefixes(paths: readonly string[], expected: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const path of paths) {
    for (const expected_path of expected) {
      if (path === expected_path || path.endsWith(`/${expected_path}`)) {
        const prefix = path.slice(0, path.length - expected_path.length);
        counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
      }
    }
  }
  return counts;
}

// Locates the expected files (relative to the main file's folder) in a selected folder of any depth.
// Works whatever the export tree, as long as the expected relative paths are found in it.
// Gives each selected path relative to the main file's folder, undefined when not referenced.
function alignOnExpectedFiles(paths: readonly string[], expected: readonly string[]): Alignment {
  const counts = countPrefixes(paths, expected);
  const best = Math.max(0, ...counts.values());
  if (best === 0) {
    return { status: "not_found" };
  }
  const prefixes = [...counts].filter(([, count]) => count === best);
  if (prefixes.length > 1) {
    return { status: "ambiguous" };
  }
  const [[prefix] = [""]] = prefixes;
  const top_directories = expected
    .filter((expected_path) => expected_path.includes("/"))
    .map((expected_path) => expected_path.slice(0, expected_path.indexOf("/") + 1));
  const aligned_paths = paths.map((path) => {
    if (!path.startsWith(prefix)) {
      return undefined;
    }
    const aligned = path.slice(prefix.length);
    const is_referenced =
      expected.includes(aligned) ||
      top_directories.some((directory) => aligned.startsWith(directory));
    return is_referenced ? aligned : undefined;
  });
  return { status: "aligned", paths: aligned_paths };
}

export { alignOnExpectedFiles, fileExtension, joinUploadPath, uploadDirectory, uploadPath };
export type { UploadFile };
