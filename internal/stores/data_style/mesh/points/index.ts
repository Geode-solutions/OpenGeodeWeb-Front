// Third party imports

// Local imports
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { isMeshPointsVertexAttributeValid, useMeshPointsVertexAttributeStyle } from "./vertex";
import { useMeshPointsColorStyle } from "./color";
import { useMeshPointsCommonStyle } from "./common";
import { useMeshPointsSizeStyle } from "./size";
import { useMeshPointsVisibilityStyle } from "./visibility";

// Local constants

function useMeshPointsColoringStyle(): {
  meshPointsColoring: (id: string) => StyleValues;
  meshPointsActiveColoring: (id: string) => string | undefined;
  setMeshPointsActiveColoring: (id: string, type: string | undefined) => Promise<unknown>;
} & ReturnType<typeof useMeshPointsColorStyle> &
  ReturnType<typeof useMeshPointsVertexAttributeStyle> {
  const meshPointsCommonStyle = useMeshPointsCommonStyle();
  const meshPointsColorStyle = useMeshPointsColorStyle();
  const meshPointsVertexAttributeStyle = useMeshPointsVertexAttributeStyle();

  function meshPointsColoring(id: string): StyleValues {
    return meshPointsCommonStyle.meshPointsColoring(id);
  }

  function meshPointsActiveColoring(id: string): string | undefined {
    return meshPointsColoring(id).active as string | undefined;
  }

  async function setMeshPointsActiveColoring(
    id: string,
    type: string | undefined,
  ): Promise<unknown> {
    await meshPointsCommonStyle.mutateMeshPointsStyle(id, {
      coloring: { active: type },
    });
    if (type === "constant") {
      return meshPointsColorStyle.setMeshPointsColor(id, meshPointsColorStyle.meshPointsColor(id));
    }
    if (type === "vertex") {
      const name = meshPointsVertexAttributeStyle.meshPointsVertexAttributeName(id);
      const item = meshPointsVertexAttributeStyle.meshPointsVertexAttributeItem(id);
      const [minimum, maximum] = meshPointsVertexAttributeStyle.meshPointsVertexAttributeRange(id);
      const colorMap = meshPointsVertexAttributeStyle.meshPointsVertexAttributeColorMap(id);
      const vertex_attribute = { name, item, minimum, maximum, colorMap };
      if (!isMeshPointsVertexAttributeValid(vertex_attribute)) {
        return undefined;
      }
      return meshPointsVertexAttributeStyle.setMeshPointsVertexAttribute(id, vertex_attribute);
    }
    throw new Error(`Unknown mesh points coloring type: ${type}`);
  }

  return {
    meshPointsColoring,
    meshPointsActiveColoring,
    setMeshPointsActiveColoring,
    ...meshPointsColorStyle,
    ...meshPointsVertexAttributeStyle,
  };
}

export function useMeshPointsStyle(): {
  applyMeshPointsStyle: (id: string) => Promise<unknown[]>;
} & ReturnType<typeof useMeshPointsCommonStyle> &
  ReturnType<typeof useMeshPointsColoringStyle> &
  ReturnType<typeof useMeshPointsVisibilityStyle> &
  ReturnType<typeof useMeshPointsSizeStyle> {
  const meshPointsCommonStyle = useMeshPointsCommonStyle();
  const meshPointsVisibility = useMeshPointsVisibilityStyle();
  const meshPointsSizeStyle = useMeshPointsSizeStyle();
  const meshPointsColoringStyle = useMeshPointsColoringStyle();

  async function applyMeshPointsStyle(id: string): Promise<unknown[]> {
    return Promise.all([
      meshPointsVisibility.setMeshPointsVisibility(
        id,
        meshPointsVisibility.meshPointsVisibility(id),
      ),
      meshPointsSizeStyle.setMeshPointsSize(id, meshPointsSizeStyle.meshPointsSize(id)),
      meshPointsColoringStyle.setMeshPointsActiveColoring(
        id,
        meshPointsColoringStyle.meshPointsActiveColoring(id),
      ),
    ]);
  }

  return {
    ...meshPointsCommonStyle,
    ...meshPointsColoringStyle,
    applyMeshPointsStyle,
    ...meshPointsVisibility,
    ...meshPointsSizeStyle,
  };
}
