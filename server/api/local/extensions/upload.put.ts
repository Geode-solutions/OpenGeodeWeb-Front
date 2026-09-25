// Node imports
import { Readable } from "node:stream";
import fs from "node:fs";
import { pipeline } from "node:stream/promises";

// Third party imports
import { type H3Event, createError, defineEventHandler, getQuery, getRequestWebStream } from "h3";

// Local imports
import {
  registerExtensionFile,
  targetExtensionFilePath,
} from "@geode/opengeodeweb-front/server/utils/app_config.ts";
import { BYTES_PER_KIBIBYTE } from "@ogw_shared/utils/file.js";
import { toNodeWebStream } from "@geode/opengeodeweb-front/server/utils/stream.ts";

const CODE_200 = 200;
const CODE_201 = 201;
const MAX_FILE_MEGABYTES = 500;
const FILE_SIZE_LIMIT = MAX_FILE_MEGABYTES * BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE;

function requiredQueryString(event: H3Event, key: string): string {
  const value = getQuery(event)[key];
  if (typeof value !== "string" || value.length === 0) {
    throw createError({ statusCode: 400, message: `Missing "${key}" query parameter` });
  }
  return value;
}

function requiredQueryInt(event: H3Event, key: string): number {
  const parsed = Math.trunc(Number(requiredQueryString(event, key)));
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw createError({ statusCode: 400, message: `Invalid "${key}" query parameter` });
  }
  return parsed;
}

// The file is sent as a raw (non-multipart) body, split into sequential chunks the client uploads in order (see OpenGeodeWeb-Front's upload_file.ts and OpenGeodeWeb-Back's upload_file route, which use the same protocol). Each chunk is appended to a `.part` file; the last one triggers the existing zip-metadata registration.
export default defineEventHandler(async (event: H3Event) => {
  const projectName = requiredQueryString(event, "projectName");
  const filename = requiredQueryString(event, "filename");
  const totalChunks = requiredQueryInt(event, "total_chunks");
  const chunkIndex = requiredQueryInt(event, "chunk_index");
  if (chunkIndex >= totalChunks) {
    throw createError({ statusCode: 400, message: "chunk_index must be less than total_chunks" });
  }

  const webStream = getRequestWebStream(event);
  if (!webStream) {
    throw createError({ statusCode: 400, message: "No request body received" });
  }

  const targetPath = targetExtensionFilePath(projectName, filename);
  const partPath = `${targetPath}.part`;
  const writeStream = fs.createWriteStream(partPath, { flags: chunkIndex === 0 ? "w" : "a" });
  await pipeline(Readable.fromWeb(toNodeWebStream(webStream)), writeStream);

  const { size } = await fs.promises.stat(partPath);
  if (size > FILE_SIZE_LIMIT) {
    await fs.promises.unlink(partPath);
    throw createError({ statusCode: 400, message: "File too large" });
  }

  if (chunkIndex < totalChunks - 1) {
    return { statusCode: CODE_200 };
  }

  await fs.promises.rename(partPath, targetPath);
  await registerExtensionFile(projectName, targetPath);
  return { statusCode: CODE_201 };
});
