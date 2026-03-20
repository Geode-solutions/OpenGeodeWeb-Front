// Node imports
import { finished, pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import fs from "node:fs";
import path from "node:path";

// Third party imports
import { createError, defineEventHandler, getRequestHeaders, getRequestWebStream } from "h3";
import StreamZip from "node-stream-zip";
import busboy from "busboy";
import sanitize from "sanitize-filename";

// Local imports
import { addExtensionToConf, confFolderPath } from "@geode/opengeodeweb-front/app/utils/config.js";

const CODE_201 = 201;
const FILE_SIZE_LIMIT = 107_374_182;

export default defineEventHandler(async (event) => {
  const projectName = "vease";
  const writePromises = [];
  const savedFiles = [];

  const configFolderPath = confFolderPath(projectName);

  const busboyInstance = busboy({
    headers: getRequestHeaders(event),
    limits: {
      fileSize: FILE_SIZE_LIMIT,
      files: 1,
    },
  });

  busboyInstance.on("file", (fieldname, fileStream, info) => {
    if (fieldname !== "file") {
      // Drain & ignore unwanted fields
      fileStream.resume();
      return;
    }

    const safeFilename = sanitize(info.filename);
    const targetPath = path.join(configFolderPath, safeFilename);

    const writePromise = (async () => {
      const writeStream = fs.createWriteStream(targetPath);
      await pipeline(fileStream, writeStream);
      savedFiles.push(targetPath);
      console.log("File written:", targetPath);
    })();

    writePromises.push(writePromise);
    fileStream.on("limit", () => busboyInstance.destroy(new Error("File too large")));
  });

  busboyInstance.on("field", (name, value) => {
    console.log(`Field ${name}: ${value}`);
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

  await Promise.all(
    savedFiles.map(async (file) => {
      const StreamZipAsync = StreamZip.async;
      const zip = new StreamZipAsync({
        file,
        storeEntries: true,
      });
      const metadataJson = await zip.entryData("metadata.json");
      const metadata = JSON.parse(metadataJson);
      const { id } = metadata;
      await addExtensionToConf(projectName, {
        extensionID: id,
        extensionPath: file,
      });
    }),
  );

  return { statusCode: CODE_201 };
});
