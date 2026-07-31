// Node imports
import { finished, pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import fs from "node:fs";

// Third party imports
import {
  createError,
  defineEventHandler,
  getRequestHeaders,
  getRequestWebStream,
  readBody,
  getQuery,
} from "h3";
import busboy from "busboy";

// Local imports
import {
  registerExtensionFile,
  targetExtensionFilePath,
} from "@geode/opengeodeweb-front/server/utils/app_config.js";

const CODE_201 = 201;
const FILE_SIZE_LIMIT = 500 * 1024 * 1024;

export default defineEventHandler(async (event) => {
  const writePromises = [];
  const savedFiles = [];

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

  busboyInstance.on("file", (fieldname, fileStream, info) => {
    if (fieldname !== "file") {
      // Drain & ignore unwanted fields
      fileStream.resume();
      return;
    }
    const targetPath = targetExtensionFilePath(projectName, info.filename);
    const writePromise = (async () => {
      const writeStream = fs.createWriteStream(targetPath);
      await pipeline(fileStream, writeStream);
      savedFiles.push(targetPath);
      console.log("File written:", targetPath);
    })();
    writePromises.push(writePromise);
    fileStream.on("limit", () => busboyInstance.destroy(new Error("File too large")));
  });

  busboyInstance.on("filesLimit", () => busboyInstance.destroy(new Error("Too many files")));
  busboyInstance.on("partsLimit", () => busboyInstance.destroy(new Error("Too many parts")));

  const webStream = getRequestWebStream(event);
  Readable.fromWeb(webStream).pipe(busboyInstance);
  await finished(busboyInstance);
  if (writePromises.length > 0) {
    await Promise.all(writePromises);
    console.log("All disk writes completed");
  }
  if (savedFiles.length === 0) {
    throw createError({ statusCode: 400, message: "No file received" });
  }
  await Promise.all(savedFiles.map(async (file) => await registerExtensionFile(projectName, file)));
  return { statusCode: CODE_201 };
});
