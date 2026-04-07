import { setupIntegrationTests } from "@ogw_tests/integration/setup";
import { cleanupBackend } from "@ogw_front/utils/local/cleanup";

async function serverSetup(file_name, geode_object) {
  return await setupIntegrationTests(file_name, geode_object);
}

function serverCleanup(projectFolderPath) {
  return cleanupBackend(projectFolderPath);
}

export { serverSetup, serverCleanup };
