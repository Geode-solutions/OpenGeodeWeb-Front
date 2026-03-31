import { database } from "@ogw_internal/database/database.js";
import { getDefaultStyle } from "@ogw_front/utils/default_styles";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useMeshStyle } from "@ogw_internal/stores/data_style/mesh/index";
import { useModelStyle } from "@ogw_internal/stores/data_style/model/index";

export const useDataStyleStore = defineStore("dataStyle", () => {
  const dataStyleState = useDataStyleState();
  const meshStyleStore = useMeshStyle();
  const modelStyleStore = useModelStyle();
  const dataStore = useDataStore();

  async function addDataStyle(id, geode_object) {
    await database.data_style.put(structuredClone({ id, ...getDefaultStyle(geode_object) }));
  }

  async function setVisibility(id, visibility) {
    const item = await dataStore.item(id);
    const { viewer_type } = item;

    if (viewer_type === "mesh") {
      return meshStyleStore.setMeshVisibility(id, visibility);
    }
    if (viewer_type === "model") {
      return modelStyleStore.setModelVisibility(id, visibility);
    }
    throw new Error("Unknown viewer_type");
  }

  async function applyDefaultStyle(id) {
    const item = await dataStore.item(id);
    const { viewer_type } = item;

    if (viewer_type === "mesh") {
      return meshStyleStore.applyMeshStyle(id);
    }
    if (viewer_type === "model") {
      return modelStyleStore.applyModelStyle(id);
    }
    throw new Error(`Unknown viewer_type: ${viewer_type}`);
  }

  function exportStores() {
    return {
      styles: dataStyleState.styles,
      componentStyles: dataStyleState.componentStyles,
    };
  }

  async function importStores(snapshot) {
    const stylesSnapshot = snapshot.styles;
    const componentStylesSnapshot = snapshot.componentStyles;

    await dataStyleState.clear();

    const style_promises = Object.entries(stylesSnapshot).map(([id, style]) =>
      database.data_style.put(structuredClone({ id, ...style })),
    );
    const component_style_promises = Object.values(componentStylesSnapshot).map((style) =>
      database.model_component_datastyle.put(structuredClone(style)),
    );

    await Promise.all([...style_promises, ...component_style_promises]);
  }

  function applyAllStylesFromState() {
    const ids = Object.keys(dataStyleState.styles);
    const promises = ids.map(async (id) => {
      const meta = await dataStore.item(id);
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
