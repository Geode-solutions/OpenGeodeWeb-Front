import { type LegacyDataId, fromLegacyDataId } from "@ogw_front/utils/legacy_data_id";
import type {
  ModelComponentStyle,
  ModelComponentTypeStyle,
  ObjectStyle,
  SceneStyle,
} from "@ogw_internal/stores/data_style/types";
import {
  componentDataStyleDb,
  componentTypeDataStyleDb,
  dataStyleDb,
  sceneStyleDb,
  writeTransaction,
} from "@ogw_internal/database/database.js";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";
import type { Visibility } from "@geode/opengeodeweb-viewer/schema_types";
import { getDefaultStyle } from "@ogw_front/utils/default_styles";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useMeshStyle } from "@ogw_internal/stores/data_style/mesh/index";
import { useModelStyle } from "@ogw_internal/stores/data_style/model/index";
import { useSceneStyle } from "@ogw_internal/stores/data_style/scene";

interface DataStyleSnapshot {
  // Projects saved before data_id existed hold their styles with an `id`
  readonly styles: Record<string, LegacyDataId<ObjectStyle> | ObjectStyle>;
  readonly componentStyles: Record<string, ModelComponentStyle>;
  // Projects saved before the styles by component type (2026-04) have none
  readonly modelComponentTypeStyles?: Record<string, ModelComponentTypeStyle>;
  readonly sceneStyle?: SceneStyle;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// oxlint-disable-next-line max-lines-per-function
export const useDataStyleStore = defineStore("dataStyle", () => {
  const dataStyleState = useDataStyleState();
  const meshStyleStore = useMeshStyle();
  const modelStyleStore = useModelStyle();
  const sceneStyleStore = useSceneStyle();
  const attributeTimeStepStyle = useAttributeTimeStepStyle();
  const dataStore = useDataStore();
  const dataStyleTable = dataStyleDb();
  // Keyed by [id_model, type] and [id_model, id_component]
  const componentTypeDataStyleTable = componentTypeDataStyleDb();
  const componentDataStyleTable = componentDataStyleDb();

  async function addDataStyle(dataId: DataId, geodeObjectType: GeodeObjectType): Promise<void> {
    const defaultStyle = getDefaultStyle(geodeObjectType);
    await dataStyleTable.put(
      structuredClone({ data_id: dataId, ...(isRecord(defaultStyle) ? defaultStyle : {}) }),
    );
  }

  // Runs the mesh or the model implementation for a data, or `notViewable` for a data the viewer
  // Does not show. An unknown viewer_object_type throws, unless `unknownType` handles it
  async function forViewerType<Result>(
    dataId: DataId,
    handlers: {
      mesh: (id: DataId) => Promise<Result>;
      model: (id: DataId) => Promise<Result>;
      notViewable: (id: DataId) => Promise<Result> | Result;
      unknownType?: (id: DataId) => Result;
    },
  ): Promise<Result> {
    const { viewer_object_type } = await dataStore.item(dataId);
    if (!(await dataStore.fetchIsViewable(dataId))) {
      const result = await handlers.notViewable(dataId);
      return result;
    }
    if (viewer_object_type === "mesh") {
      const result = await handlers.mesh(dataId);
      return result;
    }
    if (viewer_object_type === "model") {
      const result = await handlers.model(dataId);
      return result;
    }
    if (handlers.unknownType) {
      return handlers.unknownType(dataId);
    }
    throw new Error(`Unknown viewer_object_type: ${String(viewer_object_type)}`);
  }

  // A data the viewer does not show only keeps its visibility in its style
  async function setVisibility(dataId: DataId, visibility: Visibility): Promise<unknown> {
    const result = await forViewerType<unknown>(dataId, {
      mesh: async (id) => {
        const mesh_result = await meshStyleStore.setMeshVisibility(id, visibility);
        return mesh_result;
      },
      model: async (id) => {
        const model_result = await modelStyleStore.setModelVisibility(id, visibility);
        return model_result;
      },
      notViewable: async (id) => {
        const style_result = await dataStyleState.mutateStyle(id, { visibility });
        return style_result;
      },
    });
    return result;
  }

  async function applyDefaultStyle(dataId: DataId): Promise<unknown[]> {
    const result = await forViewerType(dataId, {
      mesh: meshStyleStore.applyMeshStyle,
      model: modelStyleStore.applyModelStyle,
      notViewable: () => {
        throw new Error(`applyDefaultStyle called for non-viewable item: ${dataId}`);
      },
    });
    return result;
  }

  function exportStores(): DataStyleSnapshot {
    return {
      styles: dataStyleState.styles.value,
      componentStyles: dataStyleState.componentStyles.value,
      modelComponentTypeStyles: dataStyleState.modelComponentTypeStyles.value,
      sceneStyle: dataStyleState.sceneStyle.value,
    };
  }

  // oxlint-disable-next-line prefer-readonly-parameter-types -- ObjectStyle (external type) has a mutable index signature and mutable nested StyleValues fields that can't be marked readonly from here.
  async function importStores(snapshot: DataStyleSnapshot): Promise<void> {
    const stylesSnapshot = snapshot.styles;
    const componentStylesSnapshot = snapshot.componentStyles;
    const modelComponentTypeStylesSnapshot = snapshot.modelComponentTypeStyles ?? {};

    const styles = Object.entries(stylesSnapshot).map(
      // oxlint-disable-next-line prefer-readonly-parameter-types -- same external ObjectStyle limitation as above.
      ([dataId, style]: readonly [string, LegacyDataId<ObjectStyle> | ObjectStyle]) =>
        structuredClone({ ...fromLegacyDataId<ObjectStyle>(style), data_id: dataId }),
    );
    const componentStyles = structuredClone(Object.values(componentStylesSnapshot));
    const modelComponentTypeStyles = structuredClone(
      Object.values(modelComponentTypeStylesSnapshot),
    );

    // The snapshot replaces the stored styles as a whole: a failed import leaves the previous ones
    await writeTransaction(
      [dataStyleTable, componentDataStyleTable, componentTypeDataStyleTable, sceneStyleDb()],
      async () => {
        await dataStyleState.clear();
        await dataStyleTable.bulkPut(styles);
        await componentDataStyleTable.bulkPut(componentStyles);
        await componentTypeDataStyleTable.bulkPut(modelComponentTypeStyles);
      },
    );
    await dataStyleState.loadFromDatabase();
    await sceneStyleStore.importSceneStyle(snapshot.sceneStyle);
  }

  async function applyAllStylesFromState(): Promise<void> {
    const ids = Object.keys(dataStyleState.styles.value);
    // Restores what can be shown: a non viewable data or an unknown type is skipped
    const promises = ids.map(async (dataId) => {
      await forViewerType<unknown>(dataId, {
        mesh: meshStyleStore.applyMeshStyle,
        model: modelStyleStore.applyModelStyle,
        notViewable: () => undefined,
        unknownType: () => undefined,
      });
    });
    await Promise.all(promises);
    await sceneStyleStore.applySceneStyle();
  }

  return {
    addDataStyle,
    applyDefaultStyle,
    setVisibility,
    exportStores,
    importStores,
    applyAllStylesFromState,
    ...dataStyleState,
    ...attributeTimeStepStyle,
    ...meshStyleStore,
    ...modelStyleStore,
    ...sceneStyleStore,
  };
});

export type { DataStyleSnapshot };
