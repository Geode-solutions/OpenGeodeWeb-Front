import { liveQuery } from "dexie";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state";
import { database } from "@ogw_internal/database/database";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelBlocksStyle } from "./blocks";
import { useModelCornersStyle } from "./corners";
import { useModelEdgesStyle } from "./edges";
import { useModelLinesStyle } from "./lines";
import { useModelPointsStyle } from "./points";
import { useModelSurfacesStyle } from "./surfaces";
import { useViewerStore } from "@ogw_front/stores/viewer";

const model_schemas = viewer_schemas.opengeodeweb_viewer.model;

export function useModelStyle() {
  const dataStore = useDataStore();
  const dataStyleStateStore = useDataStyleStateStore();
  const modelCornersStyleStore = useModelCornersStyle();
  const modelBlocksStyleStore = useModelBlocksStyle();
  const modelEdgesStyleStore = useModelEdgesStyle();
  const modelLinesStyleStore = useModelLinesStyle();
  const modelPointsStyleStore = useModelPointsStyle();
  const modelSurfacesStyleStore = useModelSurfacesStyle();
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();

  function modelVisibility(id) {
    return dataStyleStateStore.getStyle(id).visibility;
  }

  function setModelVisibility(id, visibility) {
    return viewerStore.request(
      model_schemas.visibility,
      { id, visibility },
      {
        response_function: async () => {
          await hybridViewerStore.setVisibility(id, visibility);
          await dataStyleStateStore.mutateStyle(id, { visibility });
          return { id, visibility };
        },
      },
    );
  }

  function visibleMeshComponents(id_ref) {
    const selection = ref([]);
    watch(
      () => (isRef(id_ref) ? id_ref.value : id_ref),
      (newId, oldId, onCleanup) => {
        if (!newId) {
          return;
        }
        const observable = liveQuery(async () => {
          const components = await database.model_components.where("id").equals(newId).toArray();
          if (components.length === 0) {
            return [];
          }

          const all_styles = await database.model_component_datastyle
            .where("id_model")
            .equals(newId)
            .toArray();
          const styles = all_styles.reduce((acc, s) => {
            acc[s.id_component] = s;
            return acc;
          }, {});

          const current_selection = [];
          const meshTypes = ["Corner", "Line", "Surface", "Block"];
          const componentsByType = components.reduce((acc, c) => {
            if (meshTypes.includes(c.type)) {
              if (!acc[c.type]) {
                acc[c.type] = [];
              }
              acc[c.type].push(c.geode_id);
            }
            return acc;
          }, {});

          for (const [type, geode_ids] of Object.entries(componentsByType)) {
            let all_visible = true;
            for (const gid of geode_ids) {
              const is_visible = styles[gid] === undefined ? true : styles[gid].visibility;
              if (is_visible) current_selection.push(gid);
              else all_visible = false;
            }
            if (all_visible) current_selection.push(type);
          }
          return current_selection;
        });

        const subscription = observable.subscribe({
          next: (val) => {
            selection.value = val;
          },
          error: (err) => console.error(err),
        });
        onCleanup(() => subscription.unsubscribe());
      },
      { immediate: true },
    );
    return selection;
  }

  function applyModelStyle(id) {
    const style = dataStyleStateStore.getStyle(id);
    const handlers = {
      visibility: () => setModelVisibility(id, style.visibility),
      corners: () => modelCornersStyleStore.applyModelCornersStyle(id),
      lines: () => modelLinesStyleStore.applyModelLinesStyle(id),
      surfaces: () => modelSurfacesStyleStore.applyModelSurfacesStyle(id),
      blocks: () => modelBlocksStyleStore.applyModelBlocksStyle(id),
      points: () => modelPointsStyleStore.applyModelPointsStyle(id),
      edges: () => modelEdgesStyleStore.applyModelEdgesStyle(id),
    };

    const promises = Object.keys(style)
      .filter((key) => handlers[key])
      .map((key) => handlers[key]());

    return Promise.all(promises);
  }

  function setModelMeshComponentsDefaultStyle(id) {
    return dataStore.item(id).then((item) => {
      if (!item) return [];
      const { mesh_components } = item;
      const handlers = {
        Corner: () => modelCornersStyleStore.setModelCornersDefaultStyle(id),
        Line: () => modelLinesStyleStore.setModelLinesDefaultStyle(id),
        Surface: () => modelSurfacesStyleStore.setModelSurfacesDefaultStyle(id),
        Block: () => modelBlocksStyleStore.setModelBlocksDefaultStyle(id),
      };
      return Promise.all(
        Object.keys(mesh_components)
          .filter((k) => handlers[k])
          .map((k) => handlers[k]()),
      );
    });
  }

  return {
    modelVisibility,
    visibleMeshComponents,
    setModelVisibility,
    applyModelStyle,
    setModelMeshComponentsDefaultStyle,
    ...useModelBlocksStyle(),
    ...useModelCornersStyle(),
    ...useModelEdgesStyle(),
    ...useModelLinesStyle(),
    ...useModelPointsStyle(),
    ...useModelSurfacesStyle(),
  };
}
