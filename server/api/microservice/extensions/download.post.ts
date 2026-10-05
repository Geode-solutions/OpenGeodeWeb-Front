// Node imports
import { promises as fs } from "node:fs";

// Third party imports
import { consola } from "consola";

// Local imports
import {
  registerExtensionFile,
  targetExtensionFilePath,
} from "@geode/opengeodeweb-front/server/utils/app_config.ts";

import { defineTypedEventHandler } from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

export default defineTypedEventHandler(
  schemas.api.microservice.extensions.download,
  async ({ projectName, url, extensionFileName }) => {
    consola.debug({ projectName, url, extensionFileName });
    const response: Response = await fetch(url);
    const fileBuffer = await response.arrayBuffer();
    const filePath = targetExtensionFilePath(projectName, extensionFileName);
    await fs.writeFile(filePath, Buffer.from(fileBuffer));
    await registerExtensionFile(projectName, filePath);
    return { statusCode: 200 };
  },
);
