import type { UploadFile } from "@ogw_front/utils/upload_path";

const WILDCARD_SUFFIX_LENGTH = 2;

function isFileAccepted(file: File, acceptValue: string | string[] | undefined): boolean {
  const fileName = (file.name || "").toLowerCase();
  const fileType = (file.type || "").toLowerCase();
  const isVext = fileName.endsWith(".vext");

  if (acceptValue === undefined || acceptValue === "") {
    return !isVext;
  }
  let rules: string[] = [];
  if (Array.isArray(acceptValue)) {
    rules = acceptValue;
  } else if (typeof acceptValue === "string") {
    rules = acceptValue.split(",");
  }
  rules = rules.map((rule) => rule.trim()).filter(Boolean);
  if (rules.length === 0) {
    return !isVext;
  }

  return rules.some((rule) => {
    let cleanRule = rule.toLowerCase();
    if (!cleanRule) {
      return !isVext;
    }
    if (cleanRule === "*" || cleanRule === "*.*") {
      return !isVext;
    }
    if (cleanRule.startsWith("*.")) {
      cleanRule = cleanRule.slice(1);
    }
    if (cleanRule.startsWith(".")) {
      return fileName.endsWith(cleanRule);
    }
    if (cleanRule.includes("/")) {
      if (cleanRule.endsWith("/*")) {
        const typeGroup = cleanRule.slice(0, -WILDCARD_SUFFIX_LENGTH);
        return fileType.startsWith(typeGroup);
      }
      return fileType === cleanRule;
    }
    return fileName.endsWith(`.${cleanRule}`);
  });
}

async function readAllEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  // oxlint-disable-next-line promise/avoid-new
  const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
    reader.readEntries(resolve, reject);
  });
  if (batch.length === 0) {
    return [];
  }
  return [...batch, ...(await readAllEntries(reader))];
}

async function filesFromEntry(entry: FileSystemEntry, path: string): Promise<UploadFile[]> {
  if (entry.isFile) {
    // oxlint-disable-next-line promise/avoid-new
    const file = await new Promise<File>((resolve, reject) => {
      // oxlint-disable-next-line no-unsafe-type-assertion -- isFile guarantees a FileSystemFileEntry
      (entry as FileSystemFileEntry).file(resolve, reject);
    });
    return [Object.assign(file, { relativePath: path })];
  }
  // oxlint-disable-next-line no-unsafe-type-assertion -- not a file, so a FileSystemDirectoryEntry
  const children = await readAllEntries((entry as FileSystemDirectoryEntry).createReader());
  const nested = await Promise.all(
    children.map(async (child) => {
      const files = await filesFromEntry(child, `${path}/${child.name}`);
      return files;
    }),
  );
  return nested.flat();
}

export { filesFromEntry, isFileAccepted };
