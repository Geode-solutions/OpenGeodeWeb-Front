// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { convertRGBPointsToSchemaFormat } from "@ogw_front/utils/colormap"

// Local constants
const mesh_polyhedra_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra

export function useMeshPolyhedraStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()

  function meshPolyhedraStyle(id) {
    return dataStyleStateStore.getStyle(id).polyhedra
  }

  function meshPolyhedraVisibility(id) {
    return meshPolyhedraStyle(id).visibility
  }
  function setMeshPolyhedraVisibility(id, visibility) {
    const polyhedra_style = meshPolyhedraStyle(id)
    return viewerStore.request(
      mesh_polyhedra_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          polyhedra_style.visibility = visibility
          console.log(
            setMeshPolyhedraVisibility.name,
            { id },
            meshPolyhedraVisibility(id),
          )
        },
      },
    )
  }
  function meshPolyhedraActiveColoring(id) {
    return meshPolyhedraStyle(id).coloring.active
  }
  function setMeshPolyhedraActiveColoring(id, type) {
    const coloring = meshPolyhedraStyle(id).coloring
    coloring.active = type
    console.log(
      setMeshPolyhedraActiveColoring.name,
      { id },
      meshPolyhedraActiveColoring(id),
    )
    if (type === "color") {
      return setMeshPolyhedraColor(id, coloring.color)
    } else if (type === "vertex") {
      if (coloring.vertex === null) {
        return
      }
      return setPolyhedraVertexAttribute(id, coloring.vertex)
    } else if (type === "polyhedron") {
      if (coloring.polyhedron === null) {
        return
      }
      return setPolyhedraPolyhedronAttribute(id, coloring.polyhedron)
    } else {
      throw new Error("Unknown mesh polyhedra coloring type: " + type)
    }
  }

  function meshPolyhedraColor(id) {
    return meshPolyhedraStyle(id).coloring.color
  }
  function setMeshPolyhedraColor(id, color) {
    const coloring = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.color,
      { id, color },
      {
        response_function: () => {
          coloring.color = color
          console.log(
            setMeshPolyhedraColor.name,
            { id },
            JSON.stringify(meshPolyhedraColor(id)),
          )
        },
      },
    )
  }

  function polyhedraVertexAttribute(id) {
    return meshPolyhedraStyle(id).coloring.vertex
  }
  function setPolyhedraVertexAttribute(id, vertex_attribute) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    const { name } = vertex_attribute
    return viewerStore.request(
      mesh_polyhedra_schemas.vertex_attribute,
      { id, name },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            setPolyhedraVertexAttribute.name,
            { id },
            polyhedraVertexAttribute(id),
          )
        },
      },
    )
  }

  function polyhedraPolyhedronAttribute(id) {
    return meshPolyhedraStyle(id).coloring.polyhedron
  }
  function setPolyhedraPolyhedronAttribute(id, polyhedron_attribute) {
    const coloring = meshPolyhedraStyle(id).coloring
    const { name } = polyhedron_attribute
    return viewerStore.request(
      mesh_polyhedra_schemas.polyhedron_attribute,
      { id, name },
      {
        response_function: () => {
          coloring.polyhedron = polyhedron_attribute
          console.log(
            setPolyhedraPolyhedronAttribute.name,
            { id },
            polyhedraPolyhedronAttribute(id),
          )
        },
      },
    )
  }

  function setPolyhedraPolyhedronScalarRange(id, minimum, maximum) {
    const polyhedra_style = meshPolyhedraStyle(id)
    return viewerStore.request(
      mesh_polyhedra_schemas.polyhedron_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          polyhedra_style.coloring.polyhedron.min = minimum
          polyhedra_style.coloring.polyhedron.max = maximum
          console.log(setPolyhedraPolyhedronScalarRange.name, {
            id,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setPolyhedraVertexScalarRange(id, minimum, maximum) {
    const polyhedra_style = meshPolyhedraStyle(id)
    return viewerStore.request(
      mesh_polyhedra_schemas.vertex_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          polyhedra_style.coloring.vertex.min = minimum
          polyhedra_style.coloring.vertex.max = maximum
          console.log(setPolyhedraVertexScalarRange.name, {
            id,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setPolyhedraVertexColorMap(id, points, minimum, maximum) {
    const polyhedra_style = meshPolyhedraStyle(id)
    return viewerStore.request(
      mesh_polyhedra_schemas.vertex_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          polyhedra_style.coloring.vertex.colorMap = points
          console.log(setPolyhedraVertexColorMap.name, {
            id,
            points,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setPolyhedraPolyhedraColorMap(id, points, minimum, maximum) {
    const polyhedra_style = meshPolyhedraStyle(id)
    return viewerStore.request(
      mesh_polyhedra_schemas.polyhedra_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          polyhedra_style.coloring.polyhedron.colorMap = points
          console.log(setPolyhedraPolyhedraColorMap.name, {
            id,
            points,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function applyMeshPolyhedraStyle(id) {
    const style = meshPolyhedraStyle(id)
    const promises = [
      setMeshPolyhedraVisibility(id, style.visibility),
      setMeshPolyhedraActiveColoring(id, style.coloring.active),
    ]

    if (style.coloring.active === "vertex" && style.coloring.vertex) {
      const { min, max, colorMap } = style.coloring.vertex
      if (min !== undefined && max !== undefined) {
        promises.push(setPolyhedraVertexScalarRange(id, min, max))
        if (colorMap) {
          let points = colorMap
          if (typeof colorMap === "string") {
            const preset = vtkColorMaps.getPresetByName(colorMap)
            if (preset && preset.RGBPoints) {
              points = convertRGBPointsToSchemaFormat(
                preset.RGBPoints,
                min,
                max,
              )
            }
          }
          if (Array.isArray(points)) {
            promises.push(setPolyhedraVertexColorMap(id, points, min, max))
          }
        }
      }
    } else if (
      style.coloring.active === "polyhedron" &&
      style.coloring.polyhedron
    ) {
      const { min, max, colorMap } = style.coloring.polyhedron
      if (min !== undefined && max !== undefined) {
        promises.push(setPolyhedraPolyhedronScalarRange(id, min, max))
        if (colorMap) {
          let points = colorMap
          if (typeof colorMap === "string") {
            const preset = vtkColorMaps.getPresetByName(colorMap)
            if (preset && preset.RGBPoints) {
              points = convertRGBPointsToSchemaFormat(
                preset.RGBPoints,
                min,
                max,
              )
            }
          }
          if (Array.isArray(points)) {
            promises.push(setPolyhedraPolyhedraColorMap(id, points, min, max))
          }
        }
      }
    }

    return Promise.all(promises)
  }

  return {
    applyMeshPolyhedraStyle,
    meshPolyhedraActiveColoring,
    meshPolyhedraColor,
    polyhedraVertexAttribute,
    meshPolyhedraVisibility,
    polyhedraPolyhedronAttribute,
    setMeshPolyhedraActiveColoring,
    setMeshPolyhedraColor,
    setPolyhedraPolyhedronAttribute,
    setPolyhedraVertexAttribute,
    setPolyhedraPolyhedronScalarRange,
    setPolyhedraVertexScalarRange,
    setPolyhedraVertexColorMap,
    setPolyhedraPolyhedraColorMap,
    setMeshPolyhedraVisibility,
  }
}
