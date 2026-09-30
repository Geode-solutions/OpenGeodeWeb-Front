// Node imports

// Third party imports
import { consola } from "consola";
import { defineEventHandler } from "h3";

// Local imports

export default defineEventHandler(() => {
  consola.info("Killing node server process");
  // oxlint-disable-next-line no-process-exit
  process.exit();
});
