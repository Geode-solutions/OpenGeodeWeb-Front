import { database } from "@ogw_internal/database/database.js";
import { getDefaultStyle } from "@ogw_front/utils/default_styles";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useMeshStyle } from "@ogw_internal/stores/data_style/mesh/index";
import { useModelStyle } from "@ogw_internal/stores/data_style/model/index";
import type {
  ModelComponentStyle,
  ModelComponentTypeStyle,
  ObjectStyle,
} from "@ogw_internal/stores/data_style/types";

interface DataStyleSnapshot {
  styles: Record<string, ObjectStyle>;
  componentStyles: Record<string, ModelComponentStyle>;
  modelComponentTypeStyles: Record<string, ModelComponentTypeStyle>;
}

// The database's table map is dynamically assembled at runtime (see internal/database/database.ts), so `noUncheckedIndexedAccess` sees these as possibly undefined even though they're always registered before this store is used; guard defensively rather than asserting.
function requireTable<T>(table: T | undefined, name: string): T {
  if (!table) {
    throw new Error(`Database table not initialized: ${name}`);
  }
  return table;
}

// oxlint-disable-next-line max-lines-per-function
export const useDataStyleStore = defineStore("dataStyle", () => {
  const dataStyleState = useDataStyleState();
  const meshStyleStore = useMeshStyle();
  const modelStyleStore = useModelStyle();
  const dataStore = useDataStore();
  const data_style_db = requireTable(database.data_style, "data_style");
  const model_component_type_datastyle_db = requireTable(
    database.model_component_type_datastyle,
    "model_component_type_datastyle",
  );
  const component_datastyle_db = requireTable(
    database.model_component_datastyle,
    "model_component_datastyle",
  );

  async function addDataStyle(id: string, geode_object: string): Promise<void> {
    await data_style_db.put(
      structuredClone({ id, ...(getDefaultStyle(geode_object) as Record<string, unknown>) }),
    );
  }

  async function setVisibility(id: string, visibility: boolean) {
    const item = await dataStore.item(id);
    if (!(await dataStore.isItemViewable(item))) {
      return dataStyleState.mutateStyle(id, { visibility });
    }

    const { viewer_type } = item;

    if (viewer_type === "mesh") {
      return meshStyleStore.setMeshVisibility(id, visibility);
    }
    if (viewer_type === "model") {
      return modelStyleStore.setModelVisibility(id, visibility);
    }
    throw new Error("Unknown viewer_type");
  }

  async function applyDefaultStyle(id: string) {
    const item = await dataStore.item(id);
    if (!(await dataStore.isItemViewable(item))) {
      throw new Error(`applyDefaultStyle called for non-viewable item: ${id}`);
    }

    const { viewer_type } = item;

    if (viewer_type === "mesh") {
      return meshStyleStore.applyMeshStyle(id);
    }
    if (viewer_type === "model") {
      return modelStyleStore.applyModelStyle(id);
    }
    throw new Error(`Unknown viewer_type: ${viewer_type}`);
  }

  function exportStores(): DataStyleSnapshot {
    return {
      styles: dataStyleState.styles.value,
      componentStyles: dataStyleState.componentStyles.value,
      modelComponentTypeStyles: dataStyleState.modelComponentTypeStyles.value,
    };
  }

  async function importStores(snapshot: DataStyleSnapshot): Promise<void> {
    const stylesSnapshot = snapshot.styles;
    const componentStylesSnapshot = snapshot.componentStyles;
    const modelComponentTypeStylesSnapshot = snapshot.modelComponentTypeStyles;

    await dataStyleState.clear();

    const style_promises = Object.entries(stylesSnapshot).map(([id, style]) =>
      data_style_db.put(structuredClone({ ...style, id })),
    );
    const component_style_promises = Object.values(componentStylesSnapshot).map((style) =>
      component_datastyle_db.put(structuredClone(style)),
    );
    const model_component_type_style_promises = Object.values(modelComponentTypeStylesSnapshot).map(
      (style) => model_component_type_datastyle_db.put(structuredClone(style)),
    );

    await Promise.all([
      ...style_promises,
      ...component_style_promises,
      ...model_component_type_style_promises,
    ]);
  }

  function applyAllStylesFromState() {
    const ids = Object.keys(dataStyleState.styles.value);
    const promises = ids.map(async (id) => {
      const meta = await dataStore.item(id);
      if (!(await dataStore.isItemViewable(meta))) {
        return;
      }
      const viewerType = meta.viewer_type;
      if (viewerType === "mesh") {
        return meshStyleStore.applyMeshStyle(id);
      } else if (viewerType === "model") {
        return modelStyleStore.applyModelStyle(id);
      }
    });
    return Promise.all(promises);
  }

  return {
    addDataStyle,
    applyDefaultStyle,
    setVisibility,
    exportStores,
    importStores,
    applyAllStylesFromState,
    ...dataStyleState,
    ...meshStyleStore,
    ...modelStyleStore,
  };
});
