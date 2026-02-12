// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { ensureAttributeEntry } from "./utils"

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
  async function setMeshPolyhedraActiveColoring(id, type) {
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
      const attributes = coloring.vertex.storedConfigs
      const minimum = storedConfigs[name]?.minimum
      const maximum = storedConfigs[name]?.maximum
      const colorMap = storedConfigs[name]?.colorMap
      await setMeshPolyhedraVertexAttributeName(id, name)
      if (minimum !== undefined && maximum !== undefined) {
        await setMeshPolyhedraVertexAttributeRange(id, minimum, maximum)
        if (colorMap) {
          await setMeshPolyhedraVertexAttributeColorMap(
            id,
            colorMap,
            minimum,
            maximum,
          )
        }
      }
    } else if (type === "polyhedron") {
      const name = coloring.polyhedron.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const attributes = coloring.polyhedron.storedConfigs
      const minimum = storedConfigs[name]?.minimum
      const maximum = storedConfigs[name]?.maximum
      const colorMap = storedConfigs[name]?.colorMap
      await setMeshPolyhedraPolyhedronAttributeName(id, name)
      if (minimum !== undefined && maximum !== undefined) {
        await setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum)
        if (colorMap) {
          await setMeshPolyhedraPolyhedronAttributeColorMap(
            id,
            colorMap,
            minimum,
            maximum,
          )
        }
      }
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
          const storedConfigs = coloring_style.vertex.storedConfigs[name]
          coloring_style.vertex.name = name

          let minimum, maximum, colorMap
          if (
            storedConfigs &&
            storedConfigs.minimum !== undefined &&
            storedConfigs.maximum !== undefined
          ) {
            minimum = storedConfigs.minimum
            maximum = storedConfigs.maximum
            colorMap = storedConfigs.colorMap
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
    const storedConfigs =
      meshPolyhedraStyle(id).coloring.vertex.storedConfigs[name]
    return storedConfigs
      ? [storedConfigs.minimum, storedConfigs.maximum]
      : [0, 1]
  }
  function setMeshPolyhedraVertexAttributeRange(id, minimum, maximum) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    const name = coloring_style.vertex.name
    ensureAttributeEntry(coloring_style.vertex, name)
    const storedConfigs = coloring_style.vertex.storedConfigs[name]
    storedConfigs.minimum = minimum
    storedConfigs.maximum = maximum
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.vertex.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
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
    const storedConfigs =
      meshPolyhedraStyle(id).coloring.vertex.storedConfigs[name]
    return storedConfigs ? storedConfigs.colorMap : null
  }
  function setMeshPolyhedraVertexAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    const name = coloring_style.vertex.name
    ensureAttributeEntry(coloring_style.vertex, name)
    const storedConfigs = coloring_style.vertex.storedConfigs[name]
    storedConfigs.colorMap = colorMapName
    const points =
      typeof colorMapName === "string"
        ? getRGBPointsFromPreset(colorMapName)
        : colorMapName
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          console.log(setMeshPolyhedraVertexAttributeColorMap.name, {
            id,
            colorMapName: meshPolyhedraVertexAttributeColorMap(id),
          })
        },
      },
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
          const storedConfigs = coloring_style.polyhedron.storedConfigs[name]
          coloring_style.polyhedron.name = name

          let minimum, maximum, colorMap
          if (
            storedConfigs &&
            storedConfigs.minimum !== undefined &&
            storedConfigs.maximum !== undefined
          ) {
            minimum = storedConfigs.minimum
            maximum = storedConfigs.maximum
            colorMap = storedConfigs.colorMap
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
    const storedConfigs =
      meshPolyhedraStyle(id).coloring.polyhedron.storedConfigs[name]
    return storedConfigs
      ? [storedConfigs.minimum, storedConfigs.maximum]
      : [0, 1]
  }
  function setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    const name = coloring_style.polyhedron.name
    ensureAttributeEntry(coloring_style.polyhedron, name)
    const storedConfigs = coloring_style.polyhedron.storedConfigs[name]
    storedConfigs.minimum = minimum
    storedConfigs.maximum = maximum
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.polyhedron.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
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
    const storedConfigs =
      meshPolyhedraStyle(id).coloring.polyhedron.storedConfigs[name]
    return storedConfigs ? storedConfigs.colorMap : null
  }
  function setMeshPolyhedraPolyhedronAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    const name = coloring_style.polyhedron.name
    ensureAttributeEntry(coloring_style.polyhedron, name)
    const storedConfigs = coloring_style.polyhedron.storedConfigs[name]
    storedConfigs.colorMap = colorMapName
    const points =
      typeof colorMapName === "string"
        ? getRGBPointsFromPreset(colorMapName)
        : colorMapName
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.polyhedron.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          console.log(
            setMeshPolyhedraPolyhedronAttributeColorMap.name,
            { id },
            meshPolyhedraPolyhedronAttributeColorMap(id),
          )
        },
      },
    )
  }

  function applyMeshPolyhedraStyle(id) {
    return Promise.all([
      setMeshPolyhedraVisibility(id, meshPolyhedraVisibility(id)),
      setMeshPolyhedraActiveColoring(id, meshPolyhedraActiveColoring(id)),
    ])
  }

  return {
    meshPolyhedraVisibility,
    meshPolyhedraActiveColoring,
    meshPolyhedraColor,
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    setMeshPolyhedraVisibility,
    setMeshPolyhedraActiveColoring,
    setMeshPolyhedraColor,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
    setMeshPolyhedraPolyhedronAttributeName,
    setMeshPolyhedraPolyhedronAttributeRange,
    setMeshPolyhedraPolyhedronAttributeColorMap,
    applyMeshPolyhedraStyle,
  }
}
