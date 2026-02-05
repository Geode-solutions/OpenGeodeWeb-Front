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
      const name = coloring.vertex.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const attributes = coloring.vertex.attributes
      const minimum = attributes[name]?.minimum
      const maximum = attributes[name]?.maximum
      const colorMap = attributes[name]?.colorMap
      return setMeshPolyhedraVertexAttributeName(id, name).then(() => {
        if (minimum !== undefined && maximum !== undefined) {
          return setMeshPolyhedraVertexAttributeRange(
            id,
            minimum,
            maximum,
          ).then(() => {
            if (colorMap) {
              return setMeshPolyhedraVertexAttributeColorMap(
                id,
                colorMap,
                minimum,
                maximum,
              )
            }
          })
        }
      })
    } else if (type === "polyhedron") {
      const name = coloring.polyhedron.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const attributes = coloring.polyhedron.attributes
      const minimum = attributes[name]?.minimum
      const maximum = attributes[name]?.maximum
      const colorMap = attributes[name]?.colorMap
      return setMeshPolyhedraPolyhedronAttributeName(id, name).then(() => {
        if (minimum !== undefined && maximum !== undefined) {
          return setMeshPolyhedraPolyhedronAttributeRange(
            id,
            minimum,
            maximum,
          ).then(() => {
            if (colorMap) {
              return setMeshPolyhedraPolyhedronAttributeColorMap(
                id,
                colorMap,
                minimum,
                maximum,
              )
            }
          })
        }
      })
    } else {
      throw new Error("Unknown active coloring type: " + type)
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
  function setMeshPolyhedraVertexAttributeName(
    id,
    name,
    defaultMin,
    defaultMax,
  ) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.vertex.name,
      { id, name },
      {
        response_function: () => {
          const saved_preset = coloring_style.vertex.attributes[name]
          coloring_style.vertex.name = name

          let minimum, maximum, colorMap
          if (saved_preset) {
            if (
              saved_preset.minimum !== undefined &&
              saved_preset.maximum !== undefined
            ) {
              minimum = saved_preset.minimum
              maximum = saved_preset.maximum
              colorMap = saved_preset.colorMap
            }
          } else if (defaultMin !== undefined && defaultMax !== undefined) {
            minimum = defaultMin
            maximum = defaultMax
            colorMap = "Cool to Warm"
            coloring_style.vertex.attributes[name] = {
              minimum,
              maximum,
              colorMap,
            }
          }
          if (minimum !== undefined && maximum !== undefined) {
            setMeshPolyhedraVertexAttributeRange(id, minimum, maximum)
            setMeshPolyhedraVertexAttributeColorMap(
              id,
              colorMap,
              minimum,
              maximum,
            )
          }
          console.log(
            setMeshPolyhedraVertexAttributeName.name,
            { id },
            meshPolyhedraVertexAttributeName(id),
          )
        },
      },
    )
  }
  function meshPolyhedraVertexAttributeRange(id) {
    const name = meshPolyhedraVertexAttributeName(id)
    const saved_preset = meshPolyhedraStyle(id).coloring.vertex.attributes[name]
    return saved_preset ? [saved_preset.minimum, saved_preset.maximum] : [0, 1]
  }
  function setMeshPolyhedraVertexAttributeRange(id, minimum, maximum) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.vertex.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          const name = coloring_style.vertex.name
          const saved_preset = coloring_style.vertex.attributes[name]
          saved_preset.minimum = minimum
          saved_preset.maximum = maximum
          console.log(
            setMeshPolyhedraVertexAttributeRange.name,
            { id },
            meshPolyhedraVertexAttributeRange(id),
          )
        },
      },
    )
  }
  function meshPolyhedraVertexAttributeColorMap(id) {
    const name = meshPolyhedraVertexAttributeName(id)
    const saved_preset = meshPolyhedraStyle(id).coloring.vertex.attributes[name]
    return saved_preset ? saved_preset.colorMap : null
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
          const name = coloring_style.vertex.name
          const saved_preset = coloring_style.vertex.attributes[name]
          saved_preset.colorMap = colorMapName
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
  function setMeshPolyhedraPolyhedronAttributeName(
    id,
    name,
    defaultMin,
    defaultMax,
  ) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.polyhedron.name,
      { id, name },
      {
        response_function: () => {
          const saved_preset = coloring_style.polyhedron.attributes[name]
          coloring_style.polyhedron.name = name

          let minimum, maximum, colorMap
          if (saved_preset) {
            if (
              saved_preset.minimum !== undefined &&
              saved_preset.maximum !== undefined
            ) {
              minimum = saved_preset.minimum
              maximum = saved_preset.maximum
              colorMap = saved_preset.colorMap
            }
          } else if (defaultMin !== undefined && defaultMax !== undefined) {
            minimum = defaultMin
            maximum = defaultMax
            colorMap = "Cool to Warm"
            coloring_style.polyhedron.attributes[name] = {
              minimum,
              maximum,
              colorMap,
            }
          }
          if (minimum !== undefined && maximum !== undefined) {
            setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum)
            setMeshPolyhedraPolyhedronAttributeColorMap(
              id,
              colorMap,
              minimum,
              maximum,
            )
          }
          console.log(
            setMeshPolyhedraPolyhedronAttributeName.name,
            { id },
            meshPolyhedraPolyhedronAttributeName(id),
          )
        },
      },
    )
  }
  function meshPolyhedraPolyhedronAttributeRange(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id)
    const saved_preset =
      meshPolyhedraStyle(id).coloring.polyhedron.attributes[name]
    return saved_preset ? [saved_preset.minimum, saved_preset.maximum] : [0, 1]
  }
  function setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.polyhedron.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          const name = coloring_style.polyhedron.name
          const saved_preset = coloring_style.polyhedron.attributes[name]
          saved_preset.minimum = minimum
          saved_preset.maximum = maximum
          console.log(
            setMeshPolyhedraPolyhedronAttributeRange.name,
            { id },
            meshPolyhedraPolyhedronAttributeRange(id),
          )
        },
      },
    )
  }
  function meshPolyhedraPolyhedronAttributeColorMap(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id)
    const saved_preset =
      meshPolyhedraStyle(id).coloring.polyhedron.attributes[name]
    return saved_preset ? saved_preset.colorMap : null
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
          const name = coloring_style.polyhedron.name
          const saved_preset = coloring_style.polyhedron.attributes[name]
          saved_preset.colorMap = colorMapName
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
