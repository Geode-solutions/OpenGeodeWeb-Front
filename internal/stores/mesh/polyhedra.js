// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"

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
      if (coloring.vertex.name === undefined) {
        throw new Error("Vertex attribute not set")
      }
      return setMeshPolyhedraVertexAttributeName(id, coloring.vertex.name).then(() => {
        if (coloring.vertex.minimum !== undefined && coloring.vertex.maximum !== undefined) {
          return setMeshPolyhedraVertexAttributeRange(id, coloring.vertex.minimum, coloring.vertex.maximum).then(() => {
            if (coloring.vertex.colorMap) {
              return setMeshPolyhedraVertexAttributeColorMap(id, coloring.vertex.colorMap, coloring.vertex.minimum, coloring.vertex.maximum)
            }
          })
        }
      })
    } else if (type === "polyhedron") {
      if (coloring.polyhedron.name === undefined) {
        throw new Error("Polyhedron attribute not set")
      }
      return setMeshPolyhedraPolyhedronAttributeName(id, coloring.polyhedron.name).then(() => {
        if (coloring.polyhedron.minimum !== undefined && coloring.polyhedron.maximum !== undefined) {
          return setMeshPolyhedraPolyhedronAttributeRange(id, coloring.polyhedron.minimum, coloring.polyhedron.maximum).then(() => {
            if (coloring.polyhedron.colorMap) {
              return setMeshPolyhedraPolyhedronAttributeColorMap(id, coloring.polyhedron.colorMap, coloring.polyhedron.minimum, coloring.polyhedron.maximum)
            }
          })
        }
      })
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

  function meshPolyhedraVertexAttribute(id) {
    return meshPolyhedraStyle(id).coloring.vertex
  }
  function setMeshPolyhedraVertexAttribute(id, vertex_attribute) {
    return setMeshPolyhedraVertexAttributeName(id, vertex_attribute.name)
  }
  function meshPolyhedraVertexAttributeName(id) {
    const vertex = meshPolyhedraStyle(id).coloring.vertex
    return vertex ? vertex.name : ""
  }
  function setMeshPolyhedraVertexAttributeName(id, name) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.vertex.name,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.name = name
          console.log(setMeshPolyhedraVertexAttributeName.name, { id }, name)
        },
      },
    )
  }
  function meshPolyhedraVertexAttributeRange(id) {
    const vertex = meshPolyhedraStyle(id).coloring.vertex
    return vertex ? [vertex.minimum, vertex.maximum] : [0, 1]
  }
  function setMeshPolyhedraVertexAttributeRange(id, min, max) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.vertex.scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.minimum = min
          coloring_style.vertex.maximum = max
          console.log(setMeshPolyhedraVertexAttributeRange.name, {
            id,
            min,
            max,
          })
        },
      },
    )
  }
  function meshPolyhedraVertexAttributeColorMap(id) {
    const vertex = meshPolyhedraStyle(id).coloring.vertex
    return vertex ? vertex.colorMap : null
  }
  function setMeshPolyhedraVertexAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    let points = colorMapName
    if (typeof colorMapName === "string") {
      points = getRGBPointsFromPreset(colorMapName)
    }
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.colorMap = colorMapName
          console.log(setMeshPolyhedraVertexAttributeColorMap.name, {
            id,
            colorMapName,
          })
        },
      },
    )
  }

  function meshPolyhedraPolyhedronAttribute(id) {
    return meshPolyhedraStyle(id).coloring.polyhedron
  }
  function setMeshPolyhedraPolyhedronAttribute(id, polyhedron_attribute) {
    return setMeshPolyhedraPolyhedronAttributeName(
      id,
      polyhedron_attribute.name,
    )
  }
  function meshPolyhedraPolyhedronAttributeName(id) {
    const polyhedron = meshPolyhedraStyle(id).coloring.polyhedron
    return polyhedron ? polyhedron.name : ""
  }
  function setMeshPolyhedraPolyhedronAttributeName(id, name) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.polyhedron.name,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.polyhedron) {
            coloring_style.polyhedron = {}
          }
          coloring_style.polyhedron.name = name
          console.log(
            setMeshPolyhedraPolyhedronAttributeName.name,
            { id },
            name,
          )
        },
      },
    )
  }
  function meshPolyhedraPolyhedronAttributeRange(id) {
    const polyhedron = meshPolyhedraStyle(id).coloring.polyhedron
    return polyhedron ? [polyhedron.minimum, polyhedron.maximum] : [0, 1]
  }
  function setMeshPolyhedraPolyhedronAttributeRange(id, min, max) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.polyhedron.scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.polyhedron) {
            coloring_style.polyhedron = {}
          }
          coloring_style.polyhedron.minimum = min
          coloring_style.polyhedron.maximum = max
          console.log(setMeshPolyhedraPolyhedronAttributeRange.name, {
            id,
            min,
            max,
          })
        },
      },
    )
  }
  function meshPolyhedraPolyhedronAttributeColorMap(id) {
    const polyhedron = meshPolyhedraStyle(id).coloring.polyhedron
    return polyhedron ? polyhedron.colorMap : null
  }
  function setMeshPolyhedraPolyhedronAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    let points = colorMapName
    if (typeof colorMapName === "string") {
      points = getRGBPointsFromPreset(colorMapName)
    }
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.polyhedron.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.polyhedron) {
            coloring_style.polyhedron = {}
          }
          coloring_style.polyhedron.colorMap = colorMapName
          console.log(setMeshPolyhedraPolyhedronAttributeColorMap.name, {
            id,
            colorMapName,
          })
        },
      },
    )
  }

  function applyMeshPolyhedraStyle(id) {
    const style = meshPolyhedraStyle(id)
    return Promise.all([
      setMeshPolyhedraVisibility(id, style.visibility),
      setMeshPolyhedraActiveColoring(id, style.coloring.active),
    ])
  }

  return {
    meshPolyhedraVisibility,
    meshPolyhedraActiveColoring,
    meshPolyhedraColor,
    meshPolyhedraVertexAttribute,
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraPolyhedronAttribute,
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    setMeshPolyhedraVisibility,
    setMeshPolyhedraActiveColoring,
    setMeshPolyhedraColor,
    setMeshPolyhedraVertexAttribute,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
    setMeshPolyhedraPolyhedronAttribute,
    setMeshPolyhedraPolyhedronAttributeName,
    setMeshPolyhedraPolyhedronAttributeRange,
    setMeshPolyhedraPolyhedronAttributeColorMap,
    applyMeshPolyhedraStyle,
  }
}
