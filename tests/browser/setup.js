// Node.js imports
import { WebSocket } from "ws";

// Third party imports
import { afterAll, beforeAll, expect, vi } from "vitest";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_front/utils/local/app_mode";
import { importFile } from "@ogw_front/utils/file_import_workflow";
import { setupActivePinia } from "@ogw_tests/utils";
import { useAppStore } from "@ogw_front/stores/app";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

async function setupIntegrationTests(file_name, geode_object) {
  setupActivePinia();
  const appStore = useAppStore();
  const infraStore = useInfraStore();
  const viewerStore = useViewerStore();
  infraStore.app_mode = appMode.BROWSER;
  await infraStore.create_backend("", "", false);
  const id = await importFile(file_name, geode_object);
  expect(viewerStore.status).toBe(Status.CONNECTED);
  const { projectFolderPath } = appStore;
  console.log("end of setupIntegrationTests", { id, projectFolderPath });
  return { id, projectFolderPath };
}

const mockLockRequest = vi.fn().mockImplementation(async (name, task) => await task({ name }));

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
});

beforeAll(() => {
  globalThis.WebSocket = WebSocket;
});

afterAll(() => {
  delete globalThis.WebSocket;
});

export { setupIntegrationTests };
