import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import { consola } from "consola";

const MILLISECONDS_IN_SECOND = 1000;

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
    // Seconds of the whole duration, not the difference of the clock's seconds field (wrong across a minute)
    (requestEndingTime.getTime() - requestStartingTime.getTime()) / MILLISECONDS_IN_SECOND,
    "s",
  );
}

export { startRequestLog, endRequestLog };
