import type { JsonRpcSchema } from "#shared/utils/types.js";

interface Loggable {
  $id: string;
}

function startRequestLog(microservice: Loggable, schema: JsonRpcSchema): Date {
  console.log(`[${microservice.$id}] Request:`, schema.$id);
  const requestStartingTime = new Date(Date.now());
  return requestStartingTime;
}

function endRequestLog(microservice: Loggable, schema: JsonRpcSchema, requestStartingTime: Date): void {
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
