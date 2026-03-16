// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useModelLinesCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useDataStyleStateStore } from "../../state"

// Local constants
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines

export function useModelLinesColorStyle() {
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()
  const modelLinesCommonStyle = useModelLinesCommonStyle()

  function modelLineColor(id, line_id) {
    return modelLinesCommonStyle.modelLineStyle(id, line_id).color
  }

  async function setModelLinesColor(id, line_ids, color) {
    const dataStyleStateStore = useDataStyleStateStore()
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

    if (!line_ids || line_ids.length === 0) {
      return
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
      return updateState()
    }
    return viewerStore.request(
      model_lines_schemas.color,
      { id, block_ids: line_viewer_ids, color },
      {
        response_function: updateState,
      },
    )
  }

  return {
    modelLineColor,
    setModelLinesColor,
  }
}
