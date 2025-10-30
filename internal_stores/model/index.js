// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useModelSurfacesStyle } from "./surfaces.js"
import { useModelCornersStyle } from "./corners.js"
import { useModelBlocksStyle } from "./blocks.js"
import { useModelLinesStyle } from "./lines.js"
import { useModelEdgesStyle } from "./edges.js"
import { useModelPointsStyle } from "./points.js"

// Local constants
const model_schemas = viewer_schemas.opengeodeweb_viewer.model

export default function useModelStyle() {
  const dataBaseStore = useDataBaseStore()
  const dataStyleStore = useDataStyleStore()
  const modelCornersStyleStore = useModelCornersStyle()
  const modelBlocksStyleStore = useModelBlocksStyle()
  const modelEdgesStyleStore = useModelEdgesStyle()
  const modelLinesStyleStore = useModelLinesStyle()
  const modelPointsStyleStore = useModelPointsStyle()
  const modelSurfacesStyleStore = useModelSurfacesStyle()
  const hybridViewerStore = useHybridViewerStore()

  function modelVisibility(id) {
    return dataStyleStore.getStyle(id).visibility
  }
  function setModelVisibility(id, visibility) {
    return viewer_call(
      {
        schema: model_schemas.visibility,
        params: { id, visibility },
      },
      {
        response_function: () => {
          dataStyleStore.styles[id].visibility = visibility
          hybridViewerStore.setVisibility(id, visibility)
          console.log(setModelVisibility.name, { id }, modelVisibility(id))
        },
      },
    )
  }

  function visibleMeshComponents(id) {
    const visible_mesh_components = ref([])
    const styles = dataStyleStore.styles[id]
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
    return dataStyleStore.getStyle(id).color
  }
  function setModelColor(id, color) {
    return viewer_call(
      {
        schema: model_schemas.color,
        params: { id, color },
      },
      {
        response_function: () => {
          dataStyleStore.styles[id].color = color
          console.log(setModelColor.name, { id }, modelColor(id))
        },
      },
    )
  }

  function setModelMeshComponentVisibility(
    id,
    component_type,
    component_id,
    visibility,
  ) {
    if (component_type === "Corner") {
      return modelCornersStyleStore.setModelCornersVisibility(
        id,
        [component_id],
        visibility,
      )
    } else if (component_type === "Line") {
      return modelLinesStyleStore.setModelLinesVisibility(
        id,
        [component_id],
        visibility,
      )
    } else if (component_type === "Surface") {
      return modelSurfacesStyleStore.setModelSurfacesVisibility(
        id,
        [component_id],
        visibility,
      )
    } else if (component_type === "Block") {
      return modelBlocksStyleStore.setModelBlocksVisibility(
        id,
        [component_id],
        visibility,
      )
    } else {
      throw new Error("Unknown model component_type: " + component_type)
    }
  }

  function applyModelDefaultStyle(id) {
    const style = dataStyleStore.getStyle(id)
    console.log("applyModelDefaultStyle", id, style)
    const promise_array = []
    for (const [key, value] of Object.entries(style)) {
      if (key === "visibility") {
        promise_array.push(setModelVisibility(id, value))
      } else if (key === "edges") {
        promise_array.push(modelEdgesStyleStore.applyModelEdgesStyle(id))
      } else if (key === "points") {
        promise_array.push(modelPointsStyleStore.applyModelPointsStyle(id))
      } else if (key === "corners") {
        promise_array.push(modelCornersStyleStore.applyModelCornersStyle(id))
      } else if (key === "lines") {
        promise_array.push(modelLinesStyleStore.applyModelLinesStyle(id))
      } else if (key === "surfaces") {
        promise_array.push(modelSurfacesStyleStore.applyModelSurfacesStyle(id))
      } else if (key === "blocks") {
        promise_array.push(modelBlocksStyleStore.applyModelBlocksStyle(id))
      } else {
        throw new Error("Unknown key: " + key)
      }
    }
    return promise_array
  }

  function setModelMeshComponentsDefaultStyle(id) {
    const { mesh_components } = dataBaseStore.itemMetaDatas(id)
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
    setModelMeshComponentVisibility,
    applyModelDefaultStyle,
    setModelMeshComponentsDefaultStyle,
    ...useModelBlocksStyle(),
    ...useModelCornersStyle(),
    ...useModelEdgesStyle(),
    ...useModelLinesStyle(),
    ...useModelPointsStyle(),
    ...useModelSurfacesStyle(),
  }
}
