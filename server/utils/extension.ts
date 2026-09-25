// Node imports
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

// Third party imports
import { createError } from "h3";

// Local imports
import { extensionFrontendPath } from "@geode/opengeodeweb-front/server/utils/path.ts";

const extensionServerMetadataSchema = z.object({
  entry: z.string(),
});

const extensionMetadataSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    version: z.string(),
    frontendFile: z.string(),
    backendExecutable: z.string(),
    server: extensionServerMetadataSchema.optional(),
  })
  .loose();

type ExtensionMetadata = z.infer<typeof extensionMetadataSchema>;

async function readExtensionMetadata(unzippedExtensionPath: string): Promise<ExtensionMetadata> {
  const metadataPath = path.join(unzippedExtensionPath, "metadata.json");
  const metadataContent = await fs.readFile(metadataPath, "utf8");
  if (!metadataContent) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid extension file: missing metadata.json",
    });
  }

  const parsed: unknown = JSON.parse(metadataContent);
  const result = extensionMetadataSchema.safeParse(parsed);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid extension file: malformed metadata.json",
    });
  }
  const metadata = result.data;

  console.log("readExtensionMetadata", { metadata });
  if (!metadata.frontendFile) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid extension file: missing frontend JavaScript",
    });
  }
  if (!metadata.backendExecutable) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid extension file: missing backend executable",
    });
  }

  return metadata;
}

async function readExtensionFrontend(
  unzippedExtensionPath: string,
  frontendFile: string,
  id: string,
): Promise<string> {
  console.log("readExtensionFrontend", { id });
  const frontendFilePath = await extensionFrontendPath(
    unzippedExtensionPath,
    frontendFile,
    path.resolve(),
    id,
  );
  console.log("readExtensionFrontend", { frontendFilePath });
  return fs.readFile(frontendFilePath, "utf8");
}

export { readExtensionFrontend, readExtensionMetadata };
