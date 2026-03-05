// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStateStore } from "../state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines

export function useModelLinesStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()

  function modelLinesStyle(id) {
    return dataStyleStateStore.getStyle(id).lines
  }
  function modelLineStyle(id, line_id) {
    return dataStyleStateStore.getComponentStyle(id, line_id)
  }

  function modelLineVisibility(id, line_id) {
    return modelLineStyle(id, line_id).visibility
  }

  async function setModelLinesVisibility(id, line_ids, visibility) {
    if (!line_ids || line_ids.length === 0) {
      return
    }

    const updateState = async () => {
      for (const line_id of line_ids) {
        await dataStyleStateStore.mutateComponentStyle(id, line_id, (style) => {
          style.visibility = visibility
        })
      }
      console.log(
        setModelLinesVisibility.name,
        { id },
        { line_ids },
        modelLineVisibility(id, line_ids[0]),
      )
    }

    const line_viewer_ids = await dataStore.getMeshComponentsViewerIds(
      id,
      line_ids,
    )
    if (!line_viewer_ids || line_viewer_ids.length === 0) {
      console.warn(
        "[setModelLinesVisibility] No viewer IDs found, skipping visibility request",
        { id, line_ids },
      )
      await updateState()
      return
    }

    if (model_lines_schemas?.visibility) {
      return viewerStore.request(
        model_lines_schemas.visibility,
        { id, block_ids: line_viewer_ids, visibility },
        {
          response_function: updateState,
        },
      )
    } else {
      await updateState()
    }
  }

  function modelLineColor(id, line_id) {
    return modelLineStyle(id, line_id).color
  }
  async function setModelLinesColor(id, line_ids, color) {
    if (!line_ids || line_ids.length === 0) {
      return
    }

    const updateState = async () => {
      for (const line_id of line_ids) {
        await dataStyleStateStore.mutateComponentStyle(id, line_id, (style) => {
          style.color = color
        })
      }
      console.log(
        setModelLinesColor.name,
        { id },
        { line_ids },
        JSON.stringify(modelLineColor(id, line_ids[0])),
      )
    }

    const line_viewer_ids = await dataStore.getMeshComponentsViewerIds(
      id,
      line_ids,
    )
    if (!line_viewer_ids || line_viewer_ids.length === 0) {
      console.warn(
        "[setModelLinesColor] No viewer IDs found, skipping color request",
        { id, line_ids },
      )
      await updateState()
      return
    }

    if (model_lines_schemas?.color) {
      return viewerStore.request(
        model_lines_schemas.color,
        { id, block_ids: line_viewer_ids, color },
        {
          response_function: updateState,
        },
      )
    } else {
      await updateState()
    }
  }

  async function setModelLinesDefaultStyle(id) {
    const style = modelLinesStyle(id)
    const line_ids = await dataStore.getLinesGeodeIds(id)
    return Promise.all([
      setModelLinesVisibility(id, line_ids, style.visibility),
      setModelLinesColor(id, line_ids, style.color),
    ])
  }

  async function applyModelLinesStyle(id) {
    return setModelLinesDefaultStyle(id)
  }

  return {
    modelLineVisibility,
    modelLineColor,
    setModelLinesVisibility,
    setModelLinesColor,
    applyModelLinesStyle,
    setModelLinesDefaultStyle,
  }
}
