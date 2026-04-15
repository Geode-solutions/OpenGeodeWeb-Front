import { database } from "@ogw_internal/database/database";
import { getDeterministicColor } from "@ogw_front/utils/color";
import { getDefaultStyle } from "@ogw_front/utils/default_styles";
import { liveQuery } from "dexie";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelBlocksStyle } from "./blocks";
import { useModelCornersStyle } from "./corners";
import { useModelEdgesStyle } from "./edges";
import { useModelLinesStyle } from "./lines";
import { useModelPointsStyle } from "./points";
import { useModelSurfacesStyle } from "./surfaces";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const model_schemas = viewer_schemas.opengeodeweb_viewer.model;

const MESH_TYPES = ["Corner", "Line", "Surface", "Block"];

const brepDefaults = getDefaultStyle("BRep");
const DEFAULT_MODEL_COMPONENT_TYPE_COLORS = {
  Corner: brepDefaults.corners.color,
  Line: brepDefaults.lines.color,
  Surface: brepDefaults.surfaces.color,
  Block: brepDefaults.blocks.color,
};

export function useModelStyle() {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCornersStyleStore = useModelCornersStyle();
  const modelBlocksStyleStore = useModelBlocksStyle();
  const modelEdgesStyleStore = useModelEdgesStyle();
  const modelLinesStyleStore = useModelLinesStyle();
  const modelPointsStyleStore = useModelPointsStyle();
  const modelSurfacesStyleStore = useModelSurfacesStyle();
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();

  function buildSelection(modelId, components, stylesMap) {
    const componentsByType = Object.fromEntries(MESH_TYPES.map((type) => [type, []]));
    for (const component of components) {
      if (componentsByType[component.type]) {
        componentsByType[component.type].push(component);
      }
    }

    const groupStyles = dataStyleState.getStyle(modelId);
    const selection = [];
    for (const type of MESH_TYPES) {
      const typeComponents = componentsByType[type];
      if (typeComponents.length === 0) {
        continue;
      }

      const typeKey = `${type.toLowerCase()}s`;
      const defaultVisibility = groupStyles[typeKey]?.visibility ?? true;

      let allVisible = true;
      for (const component of typeComponents) {
        const isVisible = stylesMap[component.geode_id]?.visibility ?? defaultVisibility;
        if (isVisible) {
          selection.push(component.geode_id);
        } else {
          allVisible = false;
        }
      }
      if (allVisible) {
        selection.push(type);
      }
    }
    return selection;
  }

  function modelVisibility(modelId) {
    return dataStyleState.getStyle(modelId).visibility;
  }

  function setModelVisibility(modelId, visibility) {
    return viewerStore.request(
      model_schemas.visibility,
      { id: modelId, visibility },
      {
        response_function: async () => {
          await hybridViewerStore.setVisibility(modelId, visibility);
          await dataStyleState.mutateStyle(modelId, { visibility });
          return { id: modelId, visibility };
        },
      },
    );
  }

  function visibleMeshComponents(id_ref) {
    const selection = ref([]);
    watch(
      () => unref(id_ref),
      (modelId, _prev, onCleanup) => {
        if (!modelId) {
          selection.value = [];
          return;
        }
        const observable = liveQuery(async () => {
          const allComponents = await database.model_components
            .where("id")
            .equals(modelId)
            .toArray();
          if (allComponents.length === 0) {
            return [];
          }
          const componentStyles = await database.model_component_datastyle
            .where("id_model")
            .equals(modelId)
            .toArray();
          const stylesMap = Object.fromEntries(
            componentStyles.map((style) => [style.id_component, style]),
          );
          return buildSelection(modelId, allComponents, stylesMap);
        });

        const subscription = observable.subscribe({
          next: (val) => {
            selection.value = val;
          },
        });
        onCleanup(() => subscription.unsubscribe());
      },
      { immediate: true },
    );
    return selection;
  }

  function getModelComponentColor(modelId, componentId) {
    const style = dataStyleState.getComponentStyle(modelId, componentId);
    if (style.color_mode === "random") {
      return getDeterministicColor(componentId);
    }
    return style.color;
  }

  function getModelComponentColorMode(modelId, componentId) {
    return dataStyleState.getComponentStyle(modelId, componentId).color_mode || "constant";
  }

  function getModelComponentTypeColor(modelId, type) {
    const style = dataStyleState.getModelComponentTypeStyle(modelId, type);
    if (style.color_mode === "random") {
      return { r: 128, g: 128, b: 128 };
    }
    return style.color || DEFAULT_MODEL_COMPONENT_TYPE_COLORS[type];
  }

  function getModelComponentTypeColorMode(modelId, type) {
    return dataStyleState.getModelComponentTypeStyle(modelId, type).color_mode || "constant";
  }

  async function setModelComponentTypeColor(modelId, type, color) {
    viewerStore.start_request();
    try {
      await dataStyleState.mutateModelComponentTypeStyle(modelId, type, {
        color,
        color_mode: "constant",
      });
      const allComponents = await database.model_components.where("id").equals(modelId).toArray();
      const idsForType = allComponents
        .filter((component) => component.type === type)
        .map((component) => component.geode_id);
      if (idsForType.length === 0) {
        return;
      }
      await setModelComponentsColor(modelId, idsForType, color);
    } finally {
      viewerStore.stop_request();
    }
  }

  async function setModelComponentTypeColorMode(modelId, type, color_mode) {
    viewerStore.start_request();
    try {
      await dataStyleState.mutateModelComponentTypeStyle(modelId, type, { color_mode });
      const allComponents = await database.model_components.where("id").equals(modelId).toArray();
      const idsForType = allComponents
        .filter((component) => component.type === type)
        .map((component) => component.geode_id);
      if (idsForType.length === 0) {
        return;
      }

      if (color_mode === "random") {
        await setModelComponentsColor(modelId, idsForType, undefined, color_mode);
        return;
      }

      const storedTypeColor = dataStyleState.getModelComponentTypeStyle(modelId, type).color;
      if (storedTypeColor) {
        await setModelComponentsColor(modelId, idsForType, storedTypeColor, color_mode);
        return;
      }

      await database.transaction("rw", database.model_component_datastyle, async () => {
        const all_styles = await database.model_component_datastyle
          .where("id_model")
          .equals(modelId)
          .toArray();
        const style_map = Object.fromEntries(all_styles.map((s) => [s.id_component, s]));
        const updates = idsForType.map((id_component) => {
          const style = style_map[id_component] || { id_model: modelId, id_component };
          style.color_mode = color_mode;
          style.color = style.color ?? getDeterministicColor(id_component);
          return structuredClone(style);
        });
        return database.model_component_datastyle.bulkPut(updates);
      });
    } finally {
      viewerStore.stop_request();
    }
  }

  async function setModelComponentColorMode(modelId, componentId, color_mode) {
    viewerStore.start_request();
    try {
      if (color_mode === "random") {
        await dataStyleState.mutateComponentStyle(modelId, componentId, { color_mode });
        await setModelComponentsColor(modelId, [componentId], undefined, color_mode);
        return;
      }
      const style = dataStyleState.getComponentStyle(modelId, componentId);
      const color = style.color ?? getDeterministicColor(componentId);
      await dataStyleState.mutateComponentStyle(modelId, componentId, { color_mode, color });
    } finally {
      viewerStore.stop_request();
    }
  }

  async function setModelComponentsVisibility(modelId, componentIds, visibility) {
    viewerStore.start_request();
    try {
      const allComponents = await database.model_components.where("id").equals(modelId).toArray();
      const componentsMap = Object.fromEntries(
        allComponents.map((component) => [component.geode_id, component]),
      );

      return Promise.all(
        MESH_TYPES.map(async (type) => {
          const typeComponents = allComponents.filter((component) => component.type === type);
          const isSelectedType = componentIds.includes(type);
          const idsToUpdate = isSelectedType
            ? typeComponents.map((component) => component.geode_id)
            : componentIds.filter((id) => componentsMap[id]?.type === type);

          if (idsToUpdate.length === 0) {
            return;
          }

          const viewerIds = await dataStore.getMeshComponentsViewerIds(modelId, idsToUpdate);
          if (viewerIds.length > 0) {
            const schema = model_schemas[`${type.toLowerCase()}s`].visibility;
            await viewerStore.request(schema, { id: modelId, block_ids: viewerIds, visibility });
          }
          await dataStyleState.mutateComponentStyles(modelId, idsToUpdate, { visibility });
        }),
      );
    } finally {
      viewerStore.stop_request();
    }
  }

  async function setModelComponentsColor(modelId, componentIds, color, color_mode = "constant") {
    viewerStore.start_request();
    try {
      const allComponents = await database.model_components.where("id").equals(modelId).toArray();
      const componentsMap = Object.fromEntries(
        allComponents.map((component) => [component.geode_id, component]),
      );

      await dataStyleState.mutateComponentStyles(modelId, componentIds, { color, color_mode });

      const handlers = {
        Corner: (ids) =>
          modelCornersStyleStore.setModelCornersColor(modelId, ids, color, color_mode),
        Line: (ids) => modelLinesStyleStore.setModelLinesColor(modelId, ids, color, color_mode),
        Surface: (ids) =>
          modelSurfacesStyleStore.setModelSurfacesColor(modelId, ids, color, color_mode),
        Block: (ids) => modelBlocksStyleStore.setModelBlocksColor(modelId, ids, color, color_mode),
      };
      await Promise.all(
        MESH_TYPES.map((type) => {
          const idsForType = componentIds.filter((id) => componentsMap[id]?.type === type);
          return handlers[type](idsForType);
        }),
      );
    } finally {
      viewerStore.stop_request();
    }
  }

  function applyModelStyle(modelId) {
    const style = dataStyleState.getStyle(modelId);
    const handlers = {
      visibility: () => setModelVisibility(modelId, style.visibility),
      corners: () => modelCornersStyleStore.applyModelCornersStyle(modelId),
      lines: () => modelLinesStyleStore.applyModelLinesStyle(modelId),
      surfaces: () => modelSurfacesStyleStore.applyModelSurfacesStyle(modelId),
      blocks: () => modelBlocksStyleStore.applyModelBlocksStyle(modelId),
      points: () => modelPointsStyleStore.applyModelPointsStyle(modelId),
      edges: () => modelEdgesStyleStore.applyModelEdgesStyle(modelId),
    };

    return Promise.all(
      Object.keys(style)
        .filter((key) => handlers[key])
        .map((key) => handlers[key]()),
    );
  }

  function setModelMeshComponentsDefaultStyle(modelId) {
    viewerStore.start_request();
    return dataStore
      .item(modelId)
      .then((item) => {
        if (!item) {
          return [];
        }
        const { mesh_components } = item;
        const handlers = {
          Corner: () => modelCornersStyleStore.setModelCornersDefaultStyle(modelId),
          Line: () => modelLinesStyleStore.setModelLinesDefaultStyle(modelId),
          Surface: () => modelSurfacesStyleStore.setModelSurfacesDefaultStyle(modelId),
          Block: () => modelBlocksStyleStore.setModelBlocksDefaultStyle(modelId),
        };
        return Promise.all(
          Object.keys(mesh_components)
            .filter((key) => handlers[key])
            .map((key) => handlers[key]()),
        );
      })
      .finally(() => {
        viewerStore.stop_request();
      });
  }

  return {
    modelVisibility,
    visibleMeshComponents,
    setModelVisibility,
    setModelComponentsVisibility,
    getModelComponentColor,
    getModelComponentTypeColor,
    setModelComponentTypeColor,
    setModelComponentTypeColorMode,
    setModelComponentColorMode,
    setModelComponentsColor,
    getModelComponentColorMode,
    getModelComponentTypeColorMode,
    applyModelStyle,
    setModelMeshComponentsDefaultStyle,
    ...modelBlocksStyleStore,
    ...modelCornersStyleStore,
    ...modelEdgesStyleStore,
    ...modelLinesStyleStore,
    ...modelPointsStyleStore,
    ...modelSurfacesStyleStore,
  };
}
