// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { convertRGBPointsToSchemaFormat } from "@ogw_front/utils/colormap"

// Local constants
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points

export function useMeshPointsStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()

  function meshPointsStyle(id) {
    return dataStyleStateStore.getStyle(id).points
  }

  function meshPointsVisibility(id) {
    return meshPointsStyle(id).visibility
  }
  function setMeshPointsVisibility(id, visibility) {
    const points_style = meshPointsStyle(id)
    return viewerStore.request(
      mesh_points_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          points_style.visibility = visibility
          console.log(
            setMeshPointsVisibility.name,
            { id },
            meshPointsVisibility(id),
          )
        },
      },
    )
  }

  function meshPointsActiveColoring(id) {
    return meshPointsStyle(id).coloring.active
  }
  function setMeshPointsActiveColoring(id, type) {
    const coloring = meshPointsStyle(id).coloring
    coloring.active = type
    console.log(
      setMeshPointsActiveColoring.name,
      { id },
      meshPointsActiveColoring(id),
    )
    if (type === "color") {
      return setMeshPointsColor(id, coloring.color)
    } else if (type === "vertex") {
      if (coloring.vertex) {
        return setMeshPointsVertexAttribute(id, coloring.vertex)
      }
      return Promise.resolve()
    } else {
      throw new Error("Unknown mesh points coloring type: " + type)
    }
  }

  function meshPointsColor(id) {
    return meshPointsStyle(id).coloring.color
  }
  function setMeshPointsColor(id, color) {
    const coloring_style = meshPointsStyle(id).coloring
    return viewerStore.request(
      mesh_points_schemas.color,
      { id, color },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            setMeshPointsColor.name,
            { id },
            JSON.stringify(meshPointsColor(id)),
          )
        },
      },
    )
  }
  function meshPointsVertexAttribute(id) {
    return meshPointsStyle(id).coloring.vertex
  }
  function setMeshPointsVertexAttribute(id, vertex_attribute) {
    const coloring_style = meshPointsStyle(id).coloring
    const { name } = vertex_attribute
    return viewerStore.request(
      mesh_points_schemas.vertex_attribute,
      { id, name },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            setMeshPointsVertexAttribute.name,
            { id },
            meshPointsVertexAttribute(id),
          )
        },
      },
    )
  }

  function meshPointsSize(id) {
    return meshPointsStyle(id).size
  }
  function setMeshPointsSize(id, size) {
    return viewerStore.request(
      mesh_points_schemas.size,
      { id, size },
      {
        response_function: () => {
          meshPointsStyle(id).size = size
          console.log(setMeshPointsSize.name, { id }, meshPointsSize(id))
        },
      },
    )
  }

  function setMeshPointsVertexScalarRange(id, minimum, maximum) {
    const points_style = meshPointsStyle(id)
    return viewerStore.request(
      mesh_points_schemas.vertex_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          points_style.coloring.vertex.min = minimum
          points_style.coloring.vertex.max = maximum
          console.log(setMeshPointsVertexScalarRange.name, {
            id,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setMeshPointsVertexColorMap(id, points, minimum, maximum) {
    const points_style = meshPointsStyle(id)
    if (typeof points === "string") {
      const preset = vtkColorMaps.getPresetByName(points)
      if (preset && preset.RGBPoints) {
        points = convertRGBPointsToSchemaFormat(
          preset.RGBPoints,
          minimum,
          maximum,
        )
      } else {
        console.error("Invalid colormap preset:", points)
        return Promise.reject("Invalid colormap preset")
      }
    }
    return viewerStore.request(
      mesh_points_schemas.vertex_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          points_style.coloring.vertex.colorMap = points
          console.log(setMeshPointsVertexColorMap.name, {
            id,
            points,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function applyMeshPointsStyle(id) {
    const style = meshPointsStyle(id)
    const promises = [
      setMeshPointsVisibility(id, style.visibility),
      setMeshPointsActiveColoring(id, style.coloring.active),
      setMeshPointsSize(id, style.size),
    ]

    if (style.coloring.active === "vertex" && style.coloring.vertex) {
      const { min, max, colorMap } = style.coloring.vertex
      if (min !== undefined && max !== undefined) {
        promises.push(setMeshPointsVertexScalarRange(id, min, max))
        if (colorMap) {
          promises.push(setMeshPointsVertexColorMap(id, colorMap, min, max))
        }
      }
    }

    return Promise.all(promises)
  }

  return {
    meshPointsVisibility,
    meshPointsActiveColoring,
    meshPointsColor,
    meshPointsVertexAttribute,
    meshPointsSize,
    setMeshPointsVisibility,
    setMeshPointsActiveColoring,
    setMeshPointsColor,
    setMeshPointsVertexAttribute,
    setMeshPointsSize,
    setMeshPointsVertexScalarRange,
    setMeshPointsVertexColorMap,
    applyMeshPointsStyle,
  }
}
