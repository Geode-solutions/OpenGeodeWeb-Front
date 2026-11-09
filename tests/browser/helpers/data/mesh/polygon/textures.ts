// Node imports
import path from "node:path";

// Third party imports
import type { Page } from "@playwright/test";

// Local imports
import { meshViewerObjectType, polygonsFeatureName } from "../../../constants";
import { setFeatureTextures } from "../../helpers/textures";

const __dirname = import.meta.dirname;
const texture = {
  name: "test_texture",
  filePath: path.join(__dirname, "test_texture.png"),
};

async function setMeshPolygonsTextures(window: Page): Promise<void> {
  await setFeatureTextures(window, `${meshViewerObjectType}${polygonsFeatureName}Menu`, texture);
}

export { setMeshPolygonsTextures };
