// Node imports

// Third party imports
import { consola } from "consola";

import { defineTypedEventHandler } from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

// Local imports

export default defineTypedEventHandler(schemas.api.local.app.kill, () => {
  consola.info("Killing node server process");
  // oxlint-disable-next-line no-process-exit
  process.exit();
});
