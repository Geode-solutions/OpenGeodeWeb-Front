function startRequestLog(microservice, schema) {
  console.log(`[${microservice.$id}] Request:`, schema.$id);
  const requestStartingTime = new Date(Date.now());
  return requestStartingTime
}

function endRequestLog(microservice, schema, requestStartingTime) {
  const requestEndingTime = new Date(Date.now());
  console.log(
    `[${microservice.$id}] Request completed:`,
    schema.$id,
    "in",
    (requestEndingTime.getSeconds() - requestStartingTime.getSeconds()),
    "s",
  );
}

export { startRequestLog, endRequestLog }