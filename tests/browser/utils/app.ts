// Third party imports
import { commands } from "vitest/browser";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import ViewerApp from "./ViewerApp.vue";
import { appMode } from "@ogw_shared/app_mode";
import { importWorkflow } from "@ogw_front/utils/import_workflow";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

const APP_TEST_ID = "ogwApp";

let projectFolderPath: string | undefined = undefined;

// Starts a back and a viewer for this test file and hosts the real viewer, like the e2e app does
async function startViewerApp(): Promise<void> {
  const microservices = await commands.startMicroservices();
  ({ projectFolderPath } = microservices);
  const infraStore = useInfraStore();
  const backStore = useBackStore();
  const viewerStore = useViewerStore();
  // The microservices run locally, on plain http/ws
  infraStore.app_mode = appMode.BROWSER;
  infraStore.register_microservice(backStore);
  infraStore.register_microservice(viewerStore);
  backStore.default_local_port = String(microservices.backPort);
  viewerStore.default_local_port = String(microservices.viewerPort);
  // The test pages share the IndexedDB of the origin: start empty, like Vease's clear_db plugin
  await useDataStore().clear();
  await viewerStore.ws_connect();
  // Vue Test Utils stubs <Transition> with a <transition-stub> element by default: it breaks Vuetify's direct
  // Child selectors (the tooltip background is `.v-tooltip > .v-overlay__content`), so the real one is kept
  await mountSuspended(ViewerApp, {
    attachTo: document.body,
    global: { stubs: { transition: false, "transition-group": false } },
  });
}

async function stopViewerApp(): Promise<void> {
  if (projectFolderPath !== undefined) {
    await commands.stopMicroservices(projectFolderPath);
  }
}

// The files are in the folder the back reads its uploads from (see ../commands.ts)
async function loadTestDatas(
  files: { filename: string; geode_object_type: string }[],
): Promise<void> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the test names the object types
  await importWorkflow(files as Parameters<typeof importWorkflow>[0]);
}

export { APP_TEST_ID, loadTestDatas, startViewerApp, stopViewerApp };
