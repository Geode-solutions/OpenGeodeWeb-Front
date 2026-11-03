// Node imports
import child_process from "node:child_process";
import path from "node:path";

// Third party imports
import { consola } from "consola";

// Local imports
import { type NamedChildProcess, waitForReady } from "./scripts.js";
import { executablePath } from "./path.js";

interface RunArgs {
  projectFolderPath: string;
  uploadFolderPath?: string;
  [key: string]: unknown;
}

const MILLISECONDS_PER_SECOND = 1000;
const DEFAULT_TIMEOUT_SECONDS = 120;
const MAX_PORT_RETRIES = 1;
const DEFAULT_RUN_ARGS: RunArgs = { projectFolderPath: "" };
const LISTENING_LOG_PATTERN = /^Listening on https?:\/\/.+:\d+\/?\s*$/mu;

async function runScript(
  execPath: string,
  execName: string,
  args: readonly string[],
  expectedResponse: string,
  timeoutSeconds = DEFAULT_TIMEOUT_SECONDS,
): Promise<NamedChildProcess> {
  const command = executablePath(execPath, execName);
  consola.debug("runScript", command, args);
  const child = child_process.spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
  }) as NamedChildProcess;
  child.name = command.replace(/^.*[\\/]/u, "");
  child.on("spawn", () => {
    consola.info(`[${child.name}] spawned, pid=${child.pid}`);
  });
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutSeconds * MILLISECONDS_PER_SECOND);
  if (typeof timer.unref === "function") {
    timer.unref();
  }
  try {
    const result = await waitForReady(child, expectedResponse, controller.signal);
    clearTimeout(timer);
    return result;
  } catch (error) {
    clearTimeout(timer);
    child.kill();
    throw error;
  }
}

function isPortInUseError(error: unknown): boolean {
  return /EADDRINUSE|address already in use|port already in use/iu.test(String(error));
}

function backArgs(args: RunArgs, port: number): string[] {
  const { projectFolderPath } = args;
  if (!projectFolderPath) {
    throw new Error("projectFolderPath is required");
  }
  const uploadFolderPath =
    args.uploadFolderPath !== undefined && args.uploadFolderPath !== ""
      ? args.uploadFolderPath
      : path.join(projectFolderPath, "uploads");
  const executableArgs = [
    "--port",
    String(port),
    "--project_folder_path",
    projectFolderPath,
    "--upload_folder_path",
    uploadFolderPath,
    "--allowed_origins",
    "http://localhost:*",
    "--timeout",
    "0",
  ];
  if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === "development") {
    executableArgs.push("--debug");
  }
  return executableArgs;
}

async function waitUntilListening(
  child: child_process.ChildProcessWithoutNullStreams,
): Promise<void> {
  child.stderr.on("data", (data: Buffer) => {
    consola.info(`[${child.spawnfile}] STDERR:`, data.toString().trim());
  });
  child.on("close", (code) => {
    consola.info(`[${child.spawnfile}] exited with code ${code}`);
  });
  // oxlint-disable-next-line typescript/no-unnecessary-condition
  for await (const chunk of child.stdout) {
    const output = String(chunk);
    consola.info(`[${child.spawnfile}] STDOUT:`, output.trim());
    if (LISTENING_LOG_PATTERN.test(output)) {
      child.stdout.on("data", (data: Buffer) => {
        consola.info(`[${child.spawnfile}] STDOUT:`, data.toString().trim());
      });
      return;
    }
  }
  throw new Error(`${child.spawnfile} exited before becoming ready`);
}

export {
  DEFAULT_RUN_ARGS,
  MAX_PORT_RETRIES,
  backArgs,
  isPortInUseError,
  runScript,
  waitUntilListening,
};
export type { RunArgs };
