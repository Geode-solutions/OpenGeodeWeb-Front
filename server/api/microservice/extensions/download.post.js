// Node imports
import { promises as fs } from "node:fs";

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { registerExtensionFile } from "@geode/opengeodeweb-front/app/utils/extension.js";
import { targetExtensionFilePath } from "@geode/opengeodeweb-front/app/utils/config.js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { projectName, url, extensionFileName } = body;
    console.log({ projectName, url, extensionFileName });
    const fileBuffer = await fetch(url).then((file) => file.arrayBuffer());
    const filePath = targetExtensionFilePath(projectName, extensionFileName);
    await fs.writeFile(filePath, Buffer.from(fileBuffer));
    await registerExtensionFile(filePath);
    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error downloading extension:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
