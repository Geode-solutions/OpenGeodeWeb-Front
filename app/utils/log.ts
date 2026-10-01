import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import { consola } from "consola";

interface Loggable {
  $id: string;
}

function startRequestLog(microservice: Loggable, schema: JsonRpcSchema): Date {
  consola.info(`[${microservice.$id}] Request:`, schema.$id);
  const requestStartingTime = new Date(Date.now());
  return requestStartingTime;
}

function endRequestLog(
  microservice: Loggable,
  schema: JsonRpcSchema,
  requestStartingTime: Date,
): void {
  const requestEndingTime = new Date(Date.now());
  consola.info(
    `[${microservice.$id}] Request completed:`,
    schema.$id,
    "in",
    requestEndingTime.getSeconds() - requestStartingTime.getSeconds(),
    "s",
  );
}

export { startRequestLog, endRequestLog };
