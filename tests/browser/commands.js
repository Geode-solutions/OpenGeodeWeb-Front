import { cleanupBackend } from "@geode/opengeodeweb-front/app/utils/local/cleanup";
import { setupIntegrationTests } from "./setup";

async function serverSetup(file_name, geode_object) {
  console.log(`[Server] Setting up integration test for ${file_name}`);
  const result = await setupIntegrationTests(file_name, geode_object);
  console.log(`[Server] Setup done → id: ${result.id}, folder: ${result.projectFolderPath}`);
  return result;
}

async function serverCleanup(projectFolderPath) {
  console.log(`[Server] Cleaning up backend: ${projectFolderPath}`);
  await cleanupBackend(projectFolderPath);
  console.log(`[Server] Cleanup completed`);
}

export { serverSetup, serverCleanup };
