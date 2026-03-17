// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useModelLinesCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines

export function useModelLinesColorStyle() {
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()
  const modelLinesCommonStyle = useModelLinesCommonStyle()

  function modelLineColor(id, line_id) {
    return modelLinesCommonStyle.modelLineStyle(id, line_id).color
  }

  function setModelLinesColor(id, line_ids, color) {
    const mutate = () => {
      return modelLinesCommonStyle
        .mutateModelLinesStyle(id, line_ids, (style) => {
          style.color = color
          console.log(
            setModelLinesColor.name,
            { id },
            { line_ids },
            JSON.stringify(style.color),
          )
        },
        )
    }

    if (!line_ids || line_ids.length === 0) {
      return Promise.resolve()
    }
    return dataStore
      .getMeshComponentsViewerIds(id, line_ids)
      .then((line_viewer_ids) => {
        if (!line_viewer_ids || line_viewer_ids.length === 0) {
          console.warn(
            "[setModelLinesColor] No viewer IDs found, skipping color request",
            { id, line_ids },
          )
          return mutate()
        }
        return viewerStore.request(
          model_lines_schemas.color,
          { id, block_ids: line_viewer_ids, color },
          {
            response_function: mutate,
          },
        )
      })
  }

  return {
    modelLineColor,
    setModelLinesColor,
  }
}
