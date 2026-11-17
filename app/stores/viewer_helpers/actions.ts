import type { MicroserviceVersionSchema } from "@ogw_shared/utils/types.js";
import type { Vector3 } from "@kitware/vtk.js/types";
import type { ViewerRequest } from "./request.js";
import { consola } from "consola";
import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";
import opengeodeweb_viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
import { useAppStore } from "@ogw_front/stores/app";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

async function pickWorldPosition(request: ViewerRequest, x: number, y: number): Promise<Vector3> {
  const schema = opengeodeweb_viewer_schemas.opengeodeweb_viewer.viewer.get_point_position;
  const {
    x: world_x,
    y: world_y,
    z: world_z,
  } = await request({
    schema,
    params: { x: Math.round(x), y: Math.round(y) },
  });
  return [world_x, world_y, world_z];
}

async function launchViewerMicroservice(
  args: Readonly<{ projectFolderPath: string }>,
  onPort: (port: string) => void,
): Promise<unknown> {
  const appStore = useAppStore();
  const { COMMAND_VIEWER, NUXT_ROOT_PATH } = useRuntimeConfig().public;
  const schema = opengeodeweb_front_schemas.api.local.app.run_viewer;
  const params = {
    COMMAND_VIEWER,
    NUXT_ROOT_PATH,
    args,
  };
  const result = await appStore.request(
    {
      schema,
      params,
    },
    {
      response_function: (response) => {
        onPort(String(response.port));
      },
    },
  );
  return result;
}

async function fetchViewerVersion(
  request: ViewerRequest,
  schema: MicroserviceVersionSchema | undefined,
  onVersion: (version: string) => void,
): Promise<{ microservice_version: string } | undefined> {
  if (!schema) {
    return undefined;
  }
  const result = await request(
    {
      schema,
    },
    {
      response_function: ({ microservice_version }) => {
        onVersion(microservice_version);
      },
    },
  );
  return result;
}

// Shows the viewer's warnings about its rendering setup, e.g. software rendering fallback.
// Informational only: a failure is logged, never thrown, so it cannot break the connection.
async function showRenderingWarnings(request: ViewerRequest): Promise<void> {
  const schema = opengeodeweb_viewer_schemas.opengeodeweb_viewer.rendering_warnings;
  try {
    const { warnings } = await request({ schema });
    const feedbackStore = useFeedbackStore();
    for (const warning of warnings) {
      feedbackStore.add_warning(warning);
    }
  } catch (error) {
    consola.warn("[viewer] Rendering warnings unavailable:", String(error));
  }
}

export { fetchViewerVersion, launchViewerMicroservice, pickWorldPosition, showRenderingWarnings };
