// The loadTestDatas of the suites (see ../helpers/suite_runtime.ts) in browser mode: the files are imported through the
// Stores, the back reading them from the data folder (see ../commands.ts), with the object type the import UI picks

// Local imports
import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";
import type { Page } from "@playwright/test";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { importWorkflow } from "@ogw_front/utils/import_workflow";
import { resolveAllowedObjectsPerFile } from "@ogw_shared/utils/response_handlers/load.js";
import { useBackStore } from "@ogw_front/stores/back";
import { waitForActionSettled } from "@ogw_tests/browser/helpers/wait_for_action_settled";

const LOAD_TIMEOUT = 8000;

async function geodeObjectType(filename: string): Promise<GeodeObjectType> {
  const schema = back_schemas.opengeodeweb_back.allowed_objects;
  const response = await useBackStore().request({ schema, params: { filename } });
  const [file] = resolveAllowedObjectsPerFile([filename], [response]);
  // The back selects the type; otherwise the import UI preselects the best candidate
  const [selectedGeodeObject] = [
    ...(file?.selectedGeodeObjects ?? []),
    ...(file?.candidates ?? []),
  ];
  if (selectedGeodeObject === undefined) {
    throw new Error(`No geode object type could be chosen for ${filename}`);
  }
  return selectedGeodeObject;
}

async function loadTestDatas(
  window: Page,
  inputDataFilenames: string[],
  { loadTimeout = LOAD_TIMEOUT }: { loadTimeout?: number } = {},
): Promise<void> {
  const files = await Promise.all(
    inputDataFilenames.map(async (filename) => ({
      filename,
      geode_object_type: await geodeObjectType(filename),
    })),
  );
  await importWorkflow(files);
  await waitForActionSettled(window, loadTimeout);
}

export { loadTestDatas };
