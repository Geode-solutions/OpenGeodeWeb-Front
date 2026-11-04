// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners;
const file_name = "test.og_brep";
const geode_object = "BRep";
const SLEEP_MS = 200;
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;

async function sleep(milliseconds: number): Promise<void> {
  // oxlint-disable-next-line promise/avoid-new
  await new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export {
  MAXIMUM_RANGE,
  MINIMUM_RANGE,
  SLEEP_MS,
  file_name,
  geode_object,
  model_corners_schemas,
  sleep,
};
