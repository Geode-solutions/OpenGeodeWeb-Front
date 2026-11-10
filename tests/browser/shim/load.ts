// Browser mode version of Vease's e2e loader (tests/e2e/utils/load.ts): the files are imported through the stores, the
// Back reading them from the fixtures folder (see ../commands.ts), with the object type the import UI picks

// Local imports
import type { GeodeObjectType } from "@ogw_front/types/identifiers";
import type { Page } from "@playwright/test";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { importWorkflow } from "@ogw_front/utils/import_workflow";
import { resolveAllowedObjects } from "@ogw_shared/utils/response_handlers/load.js";
import { useBackStore } from "@ogw_front/stores/back";
import { waitForActionSettled } from "@ogw_tests/browser/helpers/wait_for_action_settled";

const LOAD_TIMEOUT = 8000;

async function geodeObjectType(filename: string): Promise<GeodeObjectType> {
  const schema = back_schemas.opengeodeweb_back.allowed_objects;
  const { allowed_objects } = await useBackStore().request({ schema, params: { filename } });
  const { selectedGeodeObject } = resolveAllowedObjects([filename], [allowed_objects]);
  if (selectedGeodeObject === undefined) {
    throw new Error(`No geode object type could be chosen for ${filename}`);
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the back only answers with its own object types
  return selectedGeodeObject;
}

async function loadVeaseTestDatas(
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

export { loadVeaseTestDatas };
