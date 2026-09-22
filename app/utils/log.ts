import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";

interface Loggable {
  $id: string;
}

function startRequestLog(microservice: Readonly<Loggable>, schema: Readonly<JsonRpcSchema>): Date {
  console.log(`[${microservice.$id}] Request:`, schema.$id);
  const requestStartingTime = new Date(Date.now());
  return requestStartingTime;
}

function endRequestLog(
  microservice: Readonly<Loggable>,
  schema: Readonly<JsonRpcSchema>,
  requestStartingTime: Readonly<Date>,
): void {
  const requestEndingTime = new Date(Date.now());
  console.log(
    `[${microservice.$id}] Request completed:`,
    schema.$id,
    "in",
    requestEndingTime.getSeconds() - requestStartingTime.getSeconds(),
    "s",
  );
}

export { startRequestLog, endRequestLog };
