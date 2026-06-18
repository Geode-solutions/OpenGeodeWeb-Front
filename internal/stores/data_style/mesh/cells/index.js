// Third party imports

// Local imports
import { useMeshCellsCellAttributeStyle } from "./cell";
import { useMeshCellsColorStyle } from "./color";
import { useMeshCellsCommonStyle } from "./common";
import { useMeshCellsTexturesStyle } from "./textures";
import { useMeshCellsVertexAttributeStyle } from "./vertex";
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
      const { colorMap } = meshCellsVertexAttributeStyle.meshCellsVertexAttributeStoredConfig(id, name);
      return Promise.all([
        meshCellsVertexAttributeStyle.setMeshCellsVertexAttributeName(id, name),
        meshCellsVertexAttributeStyle.setMeshCellsVertexAttributeColorMap(id, colorMap),
      ]);
    }
    if (type === "cell") {
      const name = meshCellsCellAttributeStyle.meshCellsCellAttributeName(id);
      const { colorMap } = meshCellsCellAttributeStyle.meshCellsCellAttributeStoredConfig(id, name);
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
