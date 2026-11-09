import type { GeodeObjectType } from "@ogw_front/types/identifiers";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { importWorkflow } from "@ogw_front/utils/import_workflow";
import { resolveAllowedObjects } from "@ogw_shared/utils/response_handlers/load.js";
import { useAppStore } from "@ogw_front/stores/app";
import { useBackStore } from "@ogw_front/stores/back";

interface FileToLoad {
  filename: string;
  // Resolved by the back like the import UI does when left out
  geode_object_type?: GeodeObjectType;
}

interface E2eHook {
  // Folder where the back reads the uploaded files: the e2e runner copies its fixtures there
  uploadFolderPath: () => string;
  // Imports files that are already in the upload folder, like the import UI does once the files are uploaded
  loadFiles: (files: FileToLoad[]) => Promise<string[]>;
}

declare global {
  var ogwE2e: E2eHook | undefined;
}

// The back's upload folder defaults to <project folder>/uploads (see backArgs in server/utils/microservices_process.ts)
const UPLOAD_FOLDER_NAME = "uploads";

// oxlint-disable-next-line import/no-default-export
export default defineNuxtPlugin(() => {
  const appStore = useAppStore();
  const backStore = useBackStore();

  async function resolveType({ filename, geode_object_type }: FileToLoad): Promise<{
    filename: string;
    geode_object_type: GeodeObjectType;
  }> {
    if (geode_object_type !== undefined) {
      return { filename, geode_object_type };
    }
    const schema = back_schemas.opengeodeweb_back.allowed_objects;
    const { allowed_objects } = await backStore.request({ schema, params: { filename } });
    const { selectedGeodeObject } = resolveAllowedObjects([filename], [allowed_objects]);
    if (selectedGeodeObject === undefined) {
      throw new Error(`No geode object type could be chosen for ${filename}`);
    }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the back only answers with its own object types
    return { filename, geode_object_type: selectedGeodeObject as GeodeObjectType };
  }

  globalThis.ogwE2e = {
    uploadFolderPath: (): string => `${appStore.projectFolderPath}/${UPLOAD_FOLDER_NAME}`,
    loadFiles: async (files): Promise<string[]> => {
      const resolved = await Promise.all(
        files.map(async (file) => {
          const resolvedFile = await resolveType(file);
          return resolvedFile;
        }),
      );
      const dataIds = await importWorkflow(resolved);
      return dataIds;
    },
  };
});
