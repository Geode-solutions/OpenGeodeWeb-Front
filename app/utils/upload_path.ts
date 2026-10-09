// Files carry extra app-specific bookkeeping fields once picked up by the uploader.
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

function fileExtension(path: string): string {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const index = name.lastIndexOf(".");
  return index === -1 ? "" : name.slice(index + 1).toLowerCase();
}

type FileMatch =
  | { status: "matched"; indices: (number | undefined)[] }
  | { status: "ambiguous"; path: string };

// Number of folders the two paths have in common, in order: 0 when the file names differ.
function matchScore(path: string, expected_path: string): number {
  const segments = path.split("/");
  const expected_segments = expected_path.split("/");
  if (segments.at(-1) !== expected_segments.at(-1)) {
    return 0;
  }
  // Longest common subsequence of the path segments
  let previous = Array.from({ length: expected_segments.length + 1 }, () => 0);
  for (const segment of segments) {
    const current = [0];
    for (const [index, expected_segment] of expected_segments.entries()) {
      current.push(
        segment === expected_segment
          ? (previous[index] ?? 0) + 1
          : Math.max(previous[index + 1] ?? 0, current[index] ?? 0),
      );
    }
    previous = current;
  }
  return previous.at(-1) ?? 0;
}

// Finds each expected file in a selected folder, whatever the folder layout: a selected file is
// Kept for an expected path when each is the other's closest match (most folders in common).
// Gives, for each expected path, the index of its selected path (undefined when not found).
function matchExpectedFiles(paths: readonly string[], expected: readonly string[]): FileMatch {
  const scores = expected.map((expected_path) =>
    paths.map((path) => matchScore(path, expected_path)),
  );
  const path_best_scores = paths.map((_path, index) =>
    Math.max(0, ...scores.map((expected_scores) => expected_scores[index] ?? 0)),
  );
  const indices: (number | undefined)[] = [];
  for (const [expected_index, expected_scores] of scores.entries()) {
    const best = Math.max(0, ...expected_scores);
    const candidates = expected_scores.flatMap((score, index) =>
      best > 0 && score === best && path_best_scores[index] === best ? [index] : [],
    );
    if (candidates.length > 1) {
      return { status: "ambiguous", path: expected[expected_index] ?? "" };
    }
    indices.push(candidates[0]);
  }
  return { status: "matched", indices };
}

// Shared by every drop zone that refuses folders.
const foldersIgnoredWarning = "Folders can't be dropped here";

export { fileExtension, foldersIgnoredWarning, matchExpectedFiles, uploadPath };
export type { UploadFile };
