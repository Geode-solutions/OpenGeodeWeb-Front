// Node imports
import fs from "node:fs";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

// Third party imports
import { consola } from "consola";
import pTimeout from "p-timeout";
import { rimraf } from "rimraf";

// Local imports
import { createServerWsRpcClient } from "./ws_client.js";

interface Microservice {
  type: "back" | "viewer";
  name: string;
  port: number;
  url?: string;
  method?: string;
}

const MAX_DELETE_FOLDER_RETRIES = 5;

async function deleteFolderRecursive(folderPath: string): Promise<void> {
  if (!fs.existsSync(folderPath)) {
    consola.info(`Folder ${folderPath} does not exist.`);
    return;
  }
  for (let i = 0; i <= MAX_DELETE_FOLDER_RETRIES; i += 1) {
    try {
      consola.info(`Deleting folder: ${folderPath}`);
      // oxlint-disable-next-line no-await-in-loop
      await rimraf(folderPath);
      consola.info(`Deleted folder: ${folderPath}`);
      return;
    } catch (error) {
      consola.error(`Error deleting folder ${folderPath}:`, error);
      const MILLISECONDS_PER_RETRY = 1000;
      const DELAY = MILLISECONDS_PER_RETRY * (i + 1);
      // oxlint-disable-next-line no-await-in-loop
      await setTimeout(DELAY);
      consola.info("Retrying delete folder");
    }
  }
  throw new Error(
    `Failed to delete folder ${folderPath} after ${MAX_DELETE_FOLDER_RETRIES} retries`,
  );
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  );
}

async function killHttpMicroservice(microservice: Microservice): Promise<void> {
  consola.debug("killHttpMicroservice", {
    ...microservice,
  });
  const failMessage = `Failed to kill ${microservice.name}`;
  async function do_kill(): Promise<void> {
    if (microservice.url === undefined) {
      return;
    }
    try {
      await fetch(microservice.url, {
        method: microservice.method,
      });
    } catch (error) {
      const message = isErrorWithMessage(error) ? error.message : String(error);
      consola.info(`Expected error during kill of ${microservice.name}:`, message);
    }
  }
  await pTimeout(do_kill(), {
    milliseconds: 5000,
    message: failMessage,
  });
}

async function killWebsocketMicroservice(microservice: Microservice): Promise<void> {
  consola.debug("killWebsocketMicroservice", {
    ...microservice,
  });
  const failMessage = `Failed to kill ${microservice.name}`;
  const successMessage = `Disconnected from ${microservice.name} WebSocket server`;
  async function do_kill(): Promise<void> {
    if (microservice.url === undefined) {
      return;
    }
    const client = createServerWsRpcClient(microservice.url);
    // oxlint-disable-next-line promise/avoid-new
    const closed = new Promise<void>((resolve) => {
      client.onConnectionClose(resolve);
    });
    try {
      await client.notify("application.exit");
      // Wslink handles messages asynchronously: closing right away would drop the exit request
      await closed;
      consola.info(successMessage);
    } catch (error) {
      consola.error("WebSocket error:", error);
    } finally {
      client.close();
    }
  }
  await pTimeout(do_kill(), {
    milliseconds: 5000,
    message: failMessage,
  });
}

async function killMicroservice(microservice: Microservice): Promise<void> {
  if (microservice.type === "back") {
    await killHttpMicroservice(microservice);
  } else if (microservice.type === "viewer") {
    await killWebsocketMicroservice(microservice);
  } else {
    const exhaustiveCheck: never = microservice.type;
    throw new Error(`Unknown microservice type: ${String(exhaustiveCheck)}`);
  }
}

async function killMicroservices(microservices: readonly Microservice[]): Promise<Microservice[]> {
  consola.debug("killMicroservices", {
    microservices,
  });
  const results = await Promise.allSettled(
    microservices.map(async (microservice) => {
      await killMicroservice(microservice);
    }),
  );
  return microservices.filter((_, index) => results[index]?.status !== "fulfilled");
}

function microservicesMetadatasPath(projectFolderPath: string): string {
  return path.join(projectFolderPath, "microservices.json");
}

function isMicroservicesMetadatas(value: unknown): value is { microservices: Microservice[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { microservices?: unknown }).microservices)
  );
}

function projectMicroservices(projectFolderPath: string): Microservice[] {
  consola.debug("projectMicroservices", {
    projectFolderPath,
  });
  const filePath = microservicesMetadatasPath(projectFolderPath);
  if (!fs.existsSync(filePath)) {
    const microservicesMetadatas = {
      microservices: [],
    };
    fs.writeFileSync(filePath, JSON.stringify(microservicesMetadatas, undefined, 2), "utf8");
  }
  const parsed: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!isMicroservicesMetadatas(parsed)) {
    throw new Error(`Invalid microservices metadata file: ${filePath}`);
  }
  return parsed.microservices;
}

async function cleanupBackend(projectFolderPath: string): Promise<void> {
  if (!fs.existsSync(projectFolderPath)) {
    consola.info(`Folder ${projectFolderPath} does not exist. Skipping cleanup.`);
    return;
  }
  const microservices = projectMicroservices(projectFolderPath);
  await killMicroservices(microservices);
  await deleteFolderRecursive(projectFolderPath);
}

function getMicroserviceByName(
  microservices: readonly Microservice[],
  name: string,
): Microservice | undefined {
  const found = microservices.find((microservice) => microservice.name === name);
  return found === undefined ? undefined : { ...found };
}

export {
  cleanupBackend,
  deleteFolderRecursive,
  killMicroservice,
  microservicesMetadatasPath,
  projectMicroservices,
  getMicroserviceByName,
};
export type { Microservice };
