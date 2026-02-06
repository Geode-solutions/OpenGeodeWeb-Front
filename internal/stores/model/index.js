// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
import { useDataStyleStateStore } from "../data_style_state"
import { useDataStore } from "@ogw_front/stores/data"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useModelSurfacesStyle } from "./surfaces"
import { useModelCornersStyle } from "./corners"
import { useModelBlocksStyle } from "./blocks"
import { useModelLinesStyle } from "./lines"
import { useModelEdgesStyle } from "./edges"
import { useModelPointsStyle } from "./points"

// Local constants
const model_schemas = viewer_schemas.opengeodeweb_viewer.model

export default function useModelStyle() {
  const dataStore = useDataStore()
  const dataStyleStateStore = useDataStyleStateStore()
  const modelCornersStyleStore = useModelCornersStyle()
  const modelBlocksStyleStore = useModelBlocksStyle()
  const modelEdgesStyleStore = useModelEdgesStyle()
  const modelLinesStyleStore = useModelLinesStyle()
  const modelPointsStyleStore = useModelPointsStyle()
  const modelSurfacesStyleStore = useModelSurfacesStyle()
  const hybridViewerStore = useHybridViewerStore()
  const viewerStore = useViewerStore()

  function modelVisibility(id) {
    return dataStyleStateStore.getStyle(id).visibility
  }
  function setModelVisibility(id, visibility) {
    return viewerStore.request(
      model_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          dataStyleStateStore.getStyle(id).visibility = visibility
          hybridViewerStore.setVisibility(id, visibility)
          console.log(setModelVisibility.name, { id }, modelVisibility(id))
        },
      },
    )
  }

  function visibleMeshComponents(id) {
    const visible_mesh_components = ref([])
    const styles = dataStyleStateStore.styles[id]
    if (!styles) return visible_mesh_components

    Object.entries(styles.corners || {}).forEach(([corner_id, style]) => {
      if (style.visibility) visible_mesh_components.value.push(corner_id)
    })

    Object.entries(styles.lines || {}).forEach(([line_id, style]) => {
      if (style.visibility) visible_mesh_components.value.push(line_id)
    })

    Object.entries(styles.surfaces || {}).forEach(([surface_id, style]) => {
      if (style.visibility) visible_mesh_components.value.push(surface_id)
    })

    Object.entries(styles.blocks || {}).forEach(([block_id, style]) => {
      if (style.visibility) visible_mesh_components.value.push(block_id)
    })

    return visible_mesh_components
  }

  function modelMeshComponentVisibility(id, component_type, component_id) {
    if (component_type === "Corner") {
      return modelCornersStyleStore.modelCornerVisibility(id, component_id)
    } else if (component_type === "Line") {
      return modelLinesStyleStore.modelLineVisibility(id, component_id)
    } else if (component_type === "Surface") {
      return modelSurfacesStyleStore.modelSurfaceVisibility(id, component_id)
    } else if (component_type === "Block") {
      return modelBlocksStyleStore.modelBlockVisibility(id, component_id)
    }
    throw new Error("Unknown model component_type: " + component_type)
  }

  function modelColor(id) {
    return dataStyleStateStore.getStyle(id).color
  }
  function setModelColor(id, color) {
    return viewerStore.request(
      model_schemas.color,
      { id, color },
      {
        response_function: () => {
          dataStyleStateStore.styles[id].color = color
          console.log(setModelColor.name, { id }, modelColor(id))
        },
      },
    )
  }

  async function setModelMeshComponentsVisibility(
    id,
    component_geode_ids,
    visibility,
  ) {
    const component_type = await dataStore.meshComponentType(
      id,
      component_geode_ids[0],
    )
    if (component_type === "Corner") {
      return modelCornersStyleStore.setModelCornersVisibility(
        id,
        component_geode_ids,
        visibility,
      )
    } else if (component_type === "Line") {
      return modelLinesStyleStore.setModelLinesVisibility(
        id,
        component_geode_ids,
        visibility,
      )
    } else if (component_type === "Surface") {
      return modelSurfacesStyleStore.setModelSurfacesVisibility(
        id,
        component_geode_ids,
        visibility,
      )
    } else if (component_type === "Block") {
      return modelBlocksStyleStore.setModelBlocksVisibility(
        id,
        component_geode_ids,
        visibility,
      )
    } else {
      throw new Error("Unknown model component_type: " + component_type)
    }
  }

  function applyModelStyle(id) {
    const style = dataStyleStateStore.getStyle(id)
    const promise_array = []
    for (const [key, value] of Object.entries(style)) {
      if (key === "visibility") {
        promise_array.push(setModelVisibility(id, value))
      } else if (key === "corners") {
        promise_array.push(modelCornersStyleStore.applyModelCornersStyle(id))
      } else if (key === "lines") {
        promise_array.push(modelLinesStyleStore.applyModelLinesStyle(id))
      } else if (key === "surfaces") {
        promise_array.push(modelSurfacesStyleStore.applyModelSurfacesStyle(id))
      } else if (key === "blocks") {
        promise_array.push(modelBlocksStyleStore.applyModelBlocksStyle(id))
      } else if (key === "points") {
        promise_array.push(modelPointsStyleStore.applyModelPointsStyle(id))
      } else if (key === "edges") {
        promise_array.push(modelEdgesStyleStore.applyModelEdgesStyle(id))
      } else {
        throw new Error("Unknown model key: " + key)
      }
    }
    return Promise.all(promise_array)
  }

  function setModelMeshComponentsDefaultStyle(id) {
    const item = dataStore.getItem(id)
    const { mesh_components } = item.value
    const promise_array = []
    if ("Corner" in mesh_components) {
      promise_array.push(modelCornersStyleStore.setModelCornersDefaultStyle(id))
    }
    if ("Line" in mesh_components) {
      promise_array.push(modelLinesStyleStore.setModelLinesDefaultStyle(id))
    }
    if ("Surface" in mesh_components) {
      promise_array.push(
        modelSurfacesStyleStore.setModelSurfacesDefaultStyle(id),
      )
    }
    if ("Block" in mesh_components) {
      promise_array.push(modelBlocksStyleStore.setModelBlocksDefaultStyle(id))
    }
    return promise_array
  }

  return {
    modelVisibility,
    visibleMeshComponents,
    modelMeshComponentVisibility,
    setModelVisibility,
    setModelColor,
    setModelMeshComponentsVisibility,
    applyModelStyle,
    setModelMeshComponentsDefaultStyle,
    ...useModelBlocksStyle(),
    ...useModelCornersStyle(),
    ...useModelEdgesStyle(),
    ...useModelLinesStyle(),
    ...useModelPointsStyle(),
    ...useModelSurfacesStyle(),
  }
}
