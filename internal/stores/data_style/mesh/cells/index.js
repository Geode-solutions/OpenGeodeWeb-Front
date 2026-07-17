// Third party imports

// Local imports
import { isMeshCellsVertexAttributeValid, useMeshCellsVertexAttributeStyle } from "./vertex";
import { useMeshCellsCellAttributeStyle } from "./cell";
import { useMeshCellsColorStyle } from "./color";
import { useMeshCellsCommonStyle } from "./common";
import { useMeshCellsTexturesStyle } from "./textures";
import { useMeshCellsVisibilityStyle } from "./visibility";

// Local constants

export function useMeshCellsStyle() {
  const meshCellsCommonStyle = useMeshCellsCommonStyle();
  const meshCellsVisibility = useMeshCellsVisibilityStyle();
  const meshCellsColorStyle = useMeshCellsColorStyle();
  const meshCellsTexturesStore = useMeshCellsTexturesStyle();

  function meshCellsColoring(id) {
    return meshCellsCommonStyle.meshCellsColoring(id);
  }
  const meshCellsVertexAttributeStyle = useMeshCellsVertexAttributeStyle();
  const meshCellsCellAttributeStyle = useMeshCellsCellAttributeStyle();

  function meshCellsActiveColoring(id) {
    return meshCellsColoring(id).active;
  }

  async function setMeshCellsActiveColoring(id, type) {
    await meshCellsCommonStyle.mutateMeshCellsStyle(id, {
      coloring: { active: type },
    });
    console.log(setMeshCellsActiveColoring.name, { id }, type);
    if (type === "constant") {
      return meshCellsColorStyle.setMeshCellsColor(id, meshCellsColorStyle.meshCellsColor(id));
    }
    if (type === "textures") {
      const textures = meshCellsTexturesStore.meshCellsTextures(id);
      return meshCellsTexturesStore.setMeshCellsTextures(id, textures);
    }
    if (type === "vertex") {
      const name = meshCellsVertexAttributeStyle.meshCellsVertexAttributeName(id);
      if (name === undefined) {
        return;
      }
      const item = meshCellsVertexAttributeStyle.meshCellsVertexAttributeItem(id);
      const [minimum, maximum] = meshCellsVertexAttributeStyle.meshCellsVertexAttributeRange(id);
      const colorMap = meshCellsVertexAttributeStyle.meshCellsVertexAttributeColorMap(id);
      const vertex_attribute = { name, item, minimum, maximum, colorMap };
      if (isMeshCellsVertexAttributeValid(vertex_attribute)) {
        return meshCellsVertexAttributeStyle.setMeshCellsVertexAttribute(id, vertex_attribute);
      }
    }
    if (type === "cell") {
      const name = meshCellsCellAttributeStyle.meshCellsCellAttributeName(id);
      const item = meshCellsCellAttributeStyle.meshCellsCellAttributeItem(id);
      const { colorMap } = meshCellsCellAttributeStyle.meshCellsCellAttributeStoredConfig(
        id,
        name,
        item,
      );
      return Promise.all([
        meshCellsCellAttributeStyle.setMeshCellsCellAttributeName(id, name),
        meshCellsCellAttributeStyle.setMeshCellsCellAttributeColorMap(id, colorMap),
      ]);
    }
    throw new Error(`Unknown mesh cells coloring type: ${type}`);
  }

  function applyMeshCellsStyle(id) {
    return Promise.all([
      meshCellsVisibility.setMeshCellsVisibility(id, meshCellsVisibility.meshCellsVisibility(id)),
      setMeshCellsActiveColoring(id, meshCellsActiveColoring(id)),
    ]);
  }

  return {
    ...meshCellsCommonStyle,
    meshCellsColoring,
    meshCellsActiveColoring,
    setMeshCellsActiveColoring,
    applyMeshCellsStyle,
    ...meshCellsVisibility,
    ...meshCellsColorStyle,
    ...meshCellsTexturesStore,
    ...meshCellsVertexAttributeStyle,
    ...meshCellsCellAttributeStyle,
  };
}
