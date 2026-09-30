import { type LogObject, consola } from "consola";

const WARN_LEVEL = 1;

function consoleMethod(level: number): "error" | "warn" | "log" {
  if (level < WARN_LEVEL) {
    return "error";
  }
  if (level === WARN_LEVEL) {
    return "warn";
  }
  return "log";
}

function formatArgument(argument: unknown): string {
  if (typeof argument === "string") {
    return argument;
  }
  if (argument instanceof Error) {
    return argument.stack ?? argument.message;
  }
  try {
    return JSON.stringify(argument) ?? String(argument);
  } catch {
    return String(argument);
  }
}

function plainLog(logObject: LogObject): void {
  const line = `[${logObject.type}] ${logObject.args.map(formatArgument).join(" ")}`;
  // Consola's browser reporter emits %c CSS that Electron and Playwright forward unformatted, so CI logs get this plain line instead.
  // oxlint-disable-next-line no-console
  console[consoleMethod(logObject.level)](line);
}

// Enabled at runtime through NUXT_PUBLIC_PLAIN_LOGS=true (set by the e2e harness on CI) rather than at build time, so release builds keep the styled DevTools output.
export default defineNuxtPlugin({
  name: "consola-plain-logs",
  enforce: "pre",
  setup() {
    if (useRuntimeConfig().public.PLAIN_LOGS === "true") {
      consola.setReporters([{ log: plainLog }]);
    }
  },
});
