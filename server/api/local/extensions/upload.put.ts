// oxlint-disable-next-line import/no-unassigned-import
import "@geode/opengeodeweb-front/server/types/vendor.d.ts";
// Node imports
import { finished, pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import fs from "node:fs";

// Third party imports
import {
  type H3Event,
  createError,
  defineEventHandler,
  getRequestHeaders,
  getRequestWebStream,
} from "h3";
import busboy from "busboy";

// Local imports
import {
  registerExtensionFile,
  targetExtensionFilePath,
} from "@geode/opengeodeweb-front/server/utils/app_config.ts";
import { toNodeWebStream } from "@geode/opengeodeweb-front/server/utils/stream.ts";

const CODE_201 = 201;
const BYTES_PER_KIBIBYTE = 1024;
const MAX_FILE_MEGABYTES = 500;
const FILE_SIZE_LIMIT = MAX_FILE_MEGABYTES * BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE;

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types
export default defineEventHandler(async (event: H3Event) => {
  const writePromises: Promise<void>[] = [];
  const savedFiles: string[] = [];

  const busboyInstance = busboy({
    headers: getRequestHeaders(event),
    limits: {
      fileSize: FILE_SIZE_LIMIT,
      files: 1,
    },
  });
  let projectName = "";
  busboyInstance.on("field", (name, value) => {
    console.log(`Field ${name}: ${value}`);
    if (name === "projectName") {
      projectName = value;
    }
  });

  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types
  busboyInstance.on("file", (fieldname, fileStream, info) => {
    if (fieldname !== "file") {
      // Drain & ignore unwanted fields
      fileStream.resume();
      return;
    }
    const targetPath = targetExtensionFilePath(projectName, info.filename);
    const writePromise = (async (): Promise<void> => {
      const writeStream = fs.createWriteStream(targetPath);
      await pipeline(fileStream, writeStream);
      savedFiles.push(targetPath);
      console.log("File written:", targetPath);
    })();
    writePromises.push(writePromise);
    fileStream.on("limit", () => {
      busboyInstance.destroy(new Error("File too large"));
    });
  });

  busboyInstance.on("filesLimit", () => {
    busboyInstance.destroy(new Error("Too many files"));
  });
  busboyInstance.on("partsLimit", () => {
    busboyInstance.destroy(new Error("Too many parts"));
  });

  const webStream = getRequestWebStream(event);
  if (!webStream) {
    throw createError({ statusCode: 400, message: "No request body received" });
  }
  Readable.fromWeb(toNodeWebStream(webStream)).pipe(busboyInstance);
  await finished(busboyInstance);
  if (writePromises.length > 0) {
    await Promise.all(writePromises);
    console.log("All disk writes completed");
  }
  if (savedFiles.length === 0) {
    throw createError({ statusCode: 400, message: "No file received" });
  }
  await Promise.all(
    savedFiles.map(async (file) => {
      await registerExtensionFile(projectName, file);
    }),
  );
  return { statusCode: CODE_201 };
});
