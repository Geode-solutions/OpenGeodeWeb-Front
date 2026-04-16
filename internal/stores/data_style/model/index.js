import { MESH_TYPES } from "./constants";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelBlocksStyle } from "./blocks";
import { useModelColorStyle } from "./color";
import { useModelCornersStyle } from "./corners";
import { useModelEdgesStyle } from "./edges";
import { useModelLinesStyle } from "./lines";
import { useModelPointsStyle } from "./points";
import { useModelSelection } from "./selection";
import { useModelSurfacesStyle } from "./surfaces";
import { useModelVisibilityStyle } from "./visibility";
import { useViewerStore } from "@ogw_front/stores/viewer";

async function applyComponentTypeStyle(modelId, { getIds, getStyle, setVisibility, setColor }) {
  const compIds = await getIds(modelId);
  if (!compIds?.length) {
    return;
  }

  const visibilityGroups = {};
  const colorGroups = {};

  for (const compId of compIds) {
    const style = getStyle(modelId, compId);

    const visibility = String(style.visibility);
    if (!visibilityGroups[visibility]) {
      visibilityGroups[visibility] = [];
    }
    visibilityGroups[visibility].push(compId);

    const color_mode = style.color_mode || "constant";
    const cKey = color_mode === "random" ? "random" : JSON.stringify(style.color);
    if (!colorGroups[cKey]) {
      colorGroups[cKey] = { color_mode, color: style.color, compIds: [] };
    }
    colorGroups[cKey].compIds.push(compId);
  }

  const promises = [
    ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
      setVisibility(modelId, ids, visibility === "true"),
    ),
    ...Object.values(colorGroups).map(({ color_mode, color, compIds: ids }) =>
      setColor(modelId, ids, color, color_mode),
    ),
  ];

  return Promise.all(promises);
}

export function useModelStyle() {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCornersStyleStore = useModelCornersStyle();
  const modelBlocksStyleStore = useModelBlocksStyle();
  const modelEdgesStyleStore = useModelEdgesStyle();
  const modelLinesStyleStore = useModelLinesStyle();
  const modelPointsStyleStore = useModelPointsStyle();
  const modelSurfacesStyleStore = useModelSurfacesStyle();
  const viewerStore = useViewerStore();

  const stores = {
    Corner: modelCornersStyleStore,
    Line: modelLinesStyleStore,
    Surface: modelSurfacesStyleStore,
    Block: modelBlocksStyleStore,
  };

  const modelColorStyle = useModelColorStyle(stores);
  const modelVisibilityStyle = useModelVisibilityStyle(stores);

  function visibleMeshComponents(id_ref) {
    return useModelSelection(id_ref, dataStyleState);
  }

  function applyModelStyle(modelId) {
    const style = dataStyleState.getStyle(modelId);

    return Promise.all([
      modelVisibilityStyle.setModelVisibility(modelId, style.visibility),
      ...MESH_TYPES.map((type) =>
        applyComponentTypeStyle(modelId, {
          getIds: dataStore[`get${type}sGeodeIds`],
          getStyle: stores[type][`model${type}Style`],
          setVisibility: stores[type][`setModel${type}sVisibility`],
          setColor: stores[type][`setModel${type}sColor`],
        }),
      ),
      modelPointsStyleStore.applyModelPointsStyle(modelId),
      modelEdgesStyleStore.applyModelEdgesStyle(modelId),
    ]);
  }

  async function setModelMeshComponentsDefaultStyle(modelId) {
    viewerStore.start_request();
    try {
      const item = await dataStore.item(modelId);
      if (!item) {
        return;
      }
      const { mesh_components } = item;
      return await Promise.all(
        Object.keys(mesh_components)
          .filter((key) => stores[key])
          .map((key) => stores[key][`setModel${key}sDefaultStyle`](modelId)),
      );
    } finally {
      viewerStore.stop_request();
    }
  }

  function applyModelCornersStyle(modelId) {
    return applyComponentTypeStyle(modelId, {
      getIds: dataStore.getCornersGeodeIds,
      getStyle: modelCornersStyleStore.modelCornerStyle,
      setVisibility: modelCornersStyleStore.setModelCornersVisibility,
      setColor: modelCornersStyleStore.setModelCornersColor,
    });
  }

  function applyModelLinesStyle(modelId) {
    return applyComponentTypeStyle(modelId, {
      getIds: dataStore.getLinesGeodeIds,
      getStyle: modelLinesStyleStore.modelLineStyle,
      setVisibility: modelLinesStyleStore.setModelLinesVisibility,
      setColor: modelLinesStyleStore.setModelLinesColor,
    });
  }

  function applyModelSurfacesStyle(modelId) {
    return applyComponentTypeStyle(modelId, {
      getIds: dataStore.getSurfacesGeodeIds,
      getStyle: modelSurfacesStyleStore.modelSurfaceStyle,
      setVisibility: modelSurfacesStyleStore.setModelSurfacesVisibility,
      setColor: modelSurfacesStyleStore.setModelSurfacesColor,
    });
  }

  function applyModelBlocksStyle(modelId) {
    return applyComponentTypeStyle(modelId, {
      getIds: dataStore.getBlocksGeodeIds,
      getStyle: modelBlocksStyleStore.modelBlockStyle,
      setVisibility: modelBlocksStyleStore.setModelBlocksVisibility,
      setColor: modelBlocksStyleStore.setModelBlocksColor,
    });
  }

  return {
    visibleMeshComponents,
    applyModelStyle,
    applyModelCornersStyle,
    applyModelLinesStyle,
    applyModelSurfacesStyle,
    applyModelBlocksStyle,
    setModelMeshComponentsDefaultStyle,
    ...modelColorStyle,
    ...modelVisibilityStyle,
    ...modelBlocksStyleStore,
    ...modelCornersStyleStore,
    ...modelEdgesStyleStore,
    ...modelLinesStyleStore,
    ...modelPointsStyleStore,
    ...modelSurfacesStyleStore,
  };
}
