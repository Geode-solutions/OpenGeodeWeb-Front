import {
  type ComponentStyleUpdate,
  useModelComponentStyleMutations,
  useModelComponentsPerComponentStyleMutation,
  useModelComponentsStyleMutation,
} from "./common_mutations";
import type { DataId } from "@ogw_front/types/identifiers";
import type { ParamsOf } from "@ogw_shared/utils/types.js";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";
import type viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

type ModelComponentSchemas = (typeof viewer_schemas)["opengeodeweb_viewer"]["model"][
  | "corners"
  | "lines"
  | "surfaces"
  | "blocks"];
type ModelColorSchema = ModelComponentSchemas["color"];
type ModelVisibilitySchema = ModelComponentSchemas["visibility"];
type ModelColorMode = ParamsOf<ModelColorSchema>["color_mode"];

function isModelColorMode(value: string): value is ModelColorMode {
  return value === "constant" || value === "random";
}

interface UseModelCommonStyleReturn {
  mutateComponentStyle: (
    id_model: string,
    id_component: string,
    values: StyleValues,
  ) => Promise<unknown>;
  mutateModelComponentTypeStyle: (
    id_model: string,
    type: string,
    values: StyleValues,
  ) => Promise<void>;
  mutateComponentStyles: (
    id_model: string,
    id_components: string[],
    values: StyleValues,
  ) => Promise<void>;
  bulkMutateComponentStylesPerComponent: (
    id_model: string,
    component_updates: ComponentStyleUpdate[],
  ) => Promise<void>;
  setModelTypeColor: (
    modelId: DataId,
    component_ids: string[],
    color: RGBAColor | undefined,
    schema: ModelColorSchema,
    activeColoring?: string,
    collectionId?: string,
  ) => Promise<unknown>;
  setModelTypeVisibility: (
    modelId: DataId,
    component_ids: string[],
    visibility: boolean,
    schema: ModelVisibilitySchema,
  ) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
export function useModelCommonStyle(): UseModelCommonStyleReturn {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const { mutateComponentStyle, mutateModelComponentTypeStyle } = useModelComponentStyleMutations();
  const { mutateComponentStyles } = useModelComponentsStyleMutation();
  const { bulkMutateComponentStylesPerComponent } = useModelComponentsPerComponentStyleMutation();
  async function setModelTypeColor(
    modelId: DataId,
    component_ids: string[],
    color: RGBAColor | undefined,
    schema: ModelColorSchema,
    activeColoring = "constant",
    collectionId?: string,
  ): Promise<unknown> {
    if (!component_ids?.length) {
      return undefined;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, component_ids);
    if (!viewer_ids?.length) {
      return undefined;
    }

    if (activeColoring === "constant") {
      await mutateComponentStyles(modelId, component_ids, {
        coloring: {
          constant: color,
        },
      });
    }
    if (!isModelColorMode(activeColoring)) {
      throw new Error(`Unknown model color mode: ${activeColoring}`);
    }
    const params = {
      id: modelId,
      block_ids: viewer_ids,
      color_mode: activeColoring,
      collection_id: collectionId,
      ...(activeColoring === "constant" && { color }),
    };

    return viewerStore.request(
      { schema, params },
      {
        response_function: async ({ colors }) => {
          if (activeColoring === "constant") {
            await mutateComponentStyles(modelId, component_ids, {
              coloring: {
                constant: color,
              },
            });
            return;
          }

          if (colors.length === 0) {
            return;
          }

          await bulkMutateComponentStylesPerComponent(
            modelId,
            colors.map(({ geode_id, color: color_value }) => ({
              id_component: geode_id,
              values: {
                coloring: {
                  constant: color_value,
                },
              },
            })),
          );
        },
      },
    );
  }

  async function setModelTypeVisibility(
    modelId: DataId,
    component_ids: string[],
    visibility: boolean,
    schema: ModelVisibilitySchema,
  ): Promise<unknown> {
    if (!component_ids?.length) {
      return undefined;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, component_ids);
    if (!viewer_ids?.length) {
      return undefined;
    }
    const params = { id: modelId, block_ids: viewer_ids, visibility };
    const result = await viewerStore.request(
      { schema, params },
      {
        response_function: async () => {
          await mutateComponentStyles(modelId, component_ids, { visibility });
        },
      },
    );
    return result;
  }

  return {
    mutateComponentStyle,
    mutateModelComponentTypeStyle,
    mutateComponentStyles,
    bulkMutateComponentStylesPerComponent,
    setModelTypeColor,
    setModelTypeVisibility,
  };
}
