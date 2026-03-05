// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStateStore } from "../state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners

export function useModelCornersStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()

  function modelCornersStyle(id) {
    return dataStyleStateStore.getStyle(id).corners
  }
  function modelCornerStyle(id, corner_id) {
    return dataStyleStateStore.getComponentStyle(id, corner_id)
  }

  function modelCornerVisibility(id, corner_id) {
    return modelCornerStyle(id, corner_id).visibility
  }

  async function setModelCornersVisibility(id, corner_ids, visibility) {
    if (!corner_ids || corner_ids.length === 0) {
      return
    }

    const updateState = async () => {
      for (const corner_id of corner_ids) {
        await dataStyleStateStore.mutateComponentStyle(id, corner_id, (style) => {
          style.visibility = visibility
        })
      }
      console.log(
        setModelCornersVisibility.name,
        { id },
        { corner_ids },
        modelCornerVisibility(id, corner_ids[0]),
      )
    }

    const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(
      id,
      corner_ids,
    )
    if (!corner_viewer_ids || corner_viewer_ids.length === 0) {
      console.warn(
        "[setModelCornersVisibility] No viewer IDs found, skipping visibility request",
        { id, corner_ids },
      )
      await updateState()
      return
    }

    if (model_corners_schemas?.visibility) {
      return viewerStore.request(
        model_corners_schemas.visibility,
        { id, block_ids: corner_viewer_ids, visibility },
        {
          response_function: updateState,
        },
      )
    } else {
      await updateState()
    }
  }

  function modelCornerColor(id, corner_id) {
    return modelCornerStyle(id, corner_id).color
  }


  async function setModelCornersColor(id, corner_ids, color) {
    if (!corner_ids || corner_ids.length === 0) {
      return
    }

    const updateState = async () => {
      for (const corner_id of corner_ids) {
        await dataStyleStateStore.mutateComponentStyle(id, corner_id, (style) => {
          style.color = color
        })
      }
      console.log(
        setModelCornersColor.name,
        { id },
        { corner_ids },
        JSON.stringify(modelCornerColor(id, corner_ids[0])),
      )
    }

    const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(
      id,
      corner_ids,
    )
    if (!corner_viewer_ids || corner_viewer_ids.length === 0) {
      console.warn(
        "[setModelCornersColor] No viewer IDs found, skipping color request",
        { id, corner_ids },
      )
      await updateState()
      return
    }

    if (model_corners_schemas?.color) {
      return viewerStore.request(
        model_corners_schemas.color,
        { id, block_ids: corner_viewer_ids, color },
        {
          response_function: updateState,
        },
      )
    } else {
      await updateState()
    }
  }

  async function applyModelCornersStyle(id) {
    const style = modelCornersStyle(id)
    const corner_ids = await dataStore.getCornersGeodeIds(id)
    return Promise.all([
      setModelCornersVisibility(id, corner_ids, style.visibility),
      setModelCornersColor(id, corner_ids, style.color),
    ])
  }

  async function setModelCornersDefaultStyle(id) {
    return applyModelCornersStyle(id)
  }

  return {
    modelCornerVisibility,
    modelCornerColor,
    setModelCornersVisibility,
    setModelCornersColor,
    applyModelCornersStyle,
    setModelCornersDefaultStyle,
  }
}
