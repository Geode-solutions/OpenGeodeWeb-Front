// oxlint-disable vitest/require-top-level-describe, vitest/require-mock-type-parameters

// Node.js imports
import { WebSocket } from "ws";
import path from "node:path";

// Third party imports
import { afterAll, beforeAll, expect, vi } from "vitest";
import { consola } from "consola";

// Local imports
import { addMicroserviceMetadatas, runBack, runViewer } from "@ogw_server/utils/microservices";
import { createPath, generateProjectFolderPath } from "@ogw_server/utils/path";
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_shared/app_mode";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { importFile } from "@ogw_front/utils/import_workflow";
import { setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const beforeAllTimeout = 40_000;
const data_folder = path.join("tests", "integration", "data", "uploads");
// Cleaned up after each test file, even when its setup failed before returning the folder
const startedProjectFolderPaths: string[] = [];

async function runMicroservices(): Promise<{ projectFolderPath: string }> {
  const backStore = useBackStore();
  const infraStore = useInfraStore();
  const viewerStore = useViewerStore();
  infraStore.app_mode = appMode.BROWSER;
  const { COMMAND_BACK, PROJECT, COMMAND_VIEWER, NUXT_ROOT_PATH } = useRuntimeConfig().public;
  const projectFolderPath = generateProjectFolderPath(PROJECT);
  createPath(projectFolderPath);
  startedProjectFolderPaths.push(projectFolderPath);

  // Each microservice is registered as soon as it runs, so it is killed even if the other fails
  async function startBack(): Promise<number> {
    const port = await runBack(COMMAND_BACK, NUXT_ROOT_PATH, {
      projectFolderPath,
      uploadFolderPath: data_folder,
    });
    addMicroserviceMetadatas(projectFolderPath, { type: "back", name: COMMAND_BACK, port });
    return port;
  }
  async function startViewer(): Promise<number> {
    const port = await runViewer(COMMAND_VIEWER, NUXT_ROOT_PATH, { projectFolderPath });
    addMicroserviceMetadatas(projectFolderPath, { type: "viewer", name: COMMAND_VIEWER, port });
    return port;
  }
  const [back_port, viewer_port] = await Promise.all([startBack(), startViewer()]);

  consola.debug("back_port", back_port);
  consola.debug("viewer_port", viewer_port);

  backStore.default_local_port = String(back_port);
  viewerStore.default_local_port = String(viewer_port);

  return {
    projectFolderPath,
  };
}

async function setupIntegrationTests(
  file_name: string,
  geode_object: string,
): Promise<{ id: string; projectFolderPath: string }> {
  setupActivePinia();
  const viewerStore = useViewerStore();
  const { projectFolderPath } = await runMicroservices();
  await viewerStore.ws_connect();
  const id = await importFile(file_name, geode_object);
  expect(viewerStore.status).toBe(Status.CONNECTED);
  consola.debug("end of setupIntegrationTests", { id, projectFolderPath });
  return { id, projectFolderPath };
}

const mockLockRequest = vi
  .fn()
  .mockImplementation(async (name: string, task: (lock: { name: string }) => Promise<unknown>) => {
    const result = await task({ name });
    return result;
  });

Object.defineProperty(navigator, "locks", {
  value: { request: mockLockRequest },
  configurable: true,
});
vi.stubGlobal("navigator", navigator);

beforeAll(() => {
  // oxlint-disable-next-line no-unsafe-type-assertion -- Node's "ws" WebSocket is used as a browser WebSocket polyfill in tests.
  globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;
});

afterAll(async () => {
  Reflect.deleteProperty(globalThis, "WebSocket");
  await Promise.all(
    startedProjectFolderPaths.splice(0).map(async (folderPath) => {
      await cleanupBackend(folderPath);
    }),
  );
});

export { beforeAllTimeout, runMicroservices, setupIntegrationTests };
