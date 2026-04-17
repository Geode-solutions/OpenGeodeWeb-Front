import { buildNuxt, loadNuxt } from "@nuxt/kit";
import path from "node:path";
import { setupActivePinia } from "@ogw_tests/utils";

let nuxt = undefined;

export default async function setup() {
  console.log("FROM SETUP.JS - Current Directory:", import.meta.dirname);
  await setupActivePinia();
  nuxt = await loadNuxt({
    rootDir: path.resolve(import.meta.dirname),
    server: true,
    dev: true,
    dotenv: { env: { MODE: "BROWSER" } },
  });
  console.log("FROM SETUP.JS - buildNuxt", import.meta.dirname);
  await buildNuxt(nuxt);

  await nuxt.server?.listen();

  process.env.NUXT_TEST_URL = `http://localhost:${nuxt.options.devServer.port}`;
  console.log("✓ Nuxt ready at", process.env.NUXT_TEST_URL);
}
