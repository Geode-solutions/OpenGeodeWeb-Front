// Node imports
import { promises as fs } from "node:fs";

// Third party imports
import { type H3Event, createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  registerExtensionFile,
  targetExtensionFilePath,
} from "@geode/opengeodeweb-front/server/utils/app_config.ts";

interface DownloadExtensionBody {
  projectName: string;
  url: string;
  extensionFileName: string;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody<DownloadExtensionBody>(event);
    const { projectName, url, extensionFileName } = body;
    console.log({ projectName, url, extensionFileName });
    const response: Readonly<Response> = await fetch(url);
    const fileBuffer = await response.arrayBuffer();
    const filePath = targetExtensionFilePath(projectName, extensionFileName);
    await fs.writeFile(filePath, Buffer.from(fileBuffer));
    await registerExtensionFile(projectName, filePath);
    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error downloading extension:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});
