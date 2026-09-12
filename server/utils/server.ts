// Node imports
import fs from "node:fs";
import path from "node:path";

// Third party imports
import JSZip from "jszip";
import { extract as extractTar } from "tar";

const TAR_ARCHIVE_PATTERN = /\.(?<ext>tar\.gz|tgz|tar)$/u;

async function extractZipArchive(zipFilePath: string, outputDir: string): Promise<void> {
  const data = await fs.promises.readFile(zipFilePath);
  const zip = await JSZip.loadAsync(data);
  const promises: Promise<void>[] = [];

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    const outputPath = path.join(outputDir, relativePath);

    if (zipEntry.dir) {
      promises.push(
        (async () => {
          await fs.promises.mkdir(outputPath, { recursive: true });
        })(),
      );
    } else {
      promises.push(
        (async () => {
          const content = await zipEntry.async("nodebuffer");
          await fs.promises.mkdir(path.dirname(outputPath), {
            recursive: true,
          });
          await fs.promises.writeFile(outputPath, content);
        })(),
      );
    }
  }

  await Promise.all(promises);
}

async function extractTarArchive(archivePath: string, outputDir: string): Promise<void> {
  await extractTar({ file: archivePath, cwd: outputDir });
}

async function unzipFile(
  zipFilePath: string,
  outputDir: string = zipFilePath.replace(/\.[^/.]+$/u, ""),
): Promise<string> {
  console.log("Unzipping file...", zipFilePath, outputDir);
  try {
    await fs.promises.mkdir(outputDir, { recursive: true });

    if (TAR_ARCHIVE_PATTERN.test(zipFilePath)) {
      await extractTarArchive(zipFilePath, outputDir);
    } else {
      await extractZipArchive(zipFilePath, outputDir);
    }

    console.log("Extraction complete!");
    return outputDir;
  } catch (error) {
    console.error("Error unzipping file:", error);
    throw error;
  }
}

export { unzipFile };
