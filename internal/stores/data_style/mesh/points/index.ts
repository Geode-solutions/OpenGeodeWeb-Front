// Third party imports

// Local imports
import { isMeshPointsVertexAttributeValid, useMeshPointsVertexAttributeStyle } from "./vertex";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useMeshPointsColorStyle } from "./color";
import { useMeshPointsCommonStyle } from "./common";
import { useMeshPointsSizeStyle } from "./size";
import { useMeshPointsVisibilityStyle } from "./visibility";

// Local constants

interface MeshPointsActiveColoringDeps {
  readonly commonStyle: ReturnType<typeof useMeshPointsCommonStyle>;
  readonly colorStyle: ReturnType<typeof useMeshPointsColorStyle>;
  readonly vertexAttributeStyle: ReturnType<typeof useMeshPointsVertexAttributeStyle>;
}

function handleMeshPointsVertexColoring(
  id: string,
  vertexAttributeStyle: ReturnType<typeof useMeshPointsVertexAttributeStyle>,
): Promise<unknown> | undefined {
  const name = vertexAttributeStyle.meshPointsVertexAttributeName(id);
  const item = vertexAttributeStyle.meshPointsVertexAttributeItem(id);
  const [minimum, maximum] = vertexAttributeStyle.meshPointsVertexAttributeRange(id);
  const colorMap = vertexAttributeStyle.meshPointsVertexAttributeColorMap(id);
  const vertex_attribute = { name, item, minimum, maximum, colorMap };
  if (!isMeshPointsVertexAttributeValid(vertex_attribute)) {
    return undefined;
  }
  return vertexAttributeStyle.setMeshPointsVertexAttribute(id, vertex_attribute);
}

async function setMeshPointsActiveColoring(
  id: string,
  type: string | undefined,
  deps: MeshPointsActiveColoringDeps,
): Promise<unknown> {
  await deps.commonStyle.mutateMeshPointsStyle(id, {
    coloring: { active: type },
  });
  if (type === "constant") {
    const result = await deps.colorStyle.setMeshPointsColor(
      id,
      deps.colorStyle.meshPointsColor(id),
    );
    return result;
  }
  if (type === "vertex") {
    const result = await handleMeshPointsVertexColoring(id, deps.vertexAttributeStyle);
    return result;
  }
  throw new Error(`Unknown mesh points coloring type: ${type}`);
}

async function applyMeshPointsStyle(
  id: string,
  visibilityStyle: ReturnType<typeof useMeshPointsVisibilityStyle>,
  sizeStyle: ReturnType<typeof useMeshPointsSizeStyle>,
  activeColoringType: string | undefined,
  deps: MeshPointsActiveColoringDeps,
): Promise<unknown[]> {
  const result = await Promise.all([
    visibilityStyle.setMeshPointsVisibility(id, visibilityStyle.meshPointsVisibility(id)),
    sizeStyle.setMeshPointsSize(id, sizeStyle.meshPointsSize(id)),
    setMeshPointsActiveColoring(id, activeColoringType, deps),
  ]);
  return result;
}

type UseMeshPointsStyleReturn = ReturnType<typeof useMeshPointsCommonStyle> & {
  meshPointsColoring: (id: string) => StyleValues;
  meshPointsActiveColoring: (id: string) => string | undefined;
  setMeshPointsActiveColoring: (id: string, type: string | undefined) => Promise<unknown>;
  applyMeshPointsStyle: (id: string) => Promise<unknown[]>;
} & ReturnType<typeof useMeshPointsVisibilityStyle> &
  ReturnType<typeof useMeshPointsColorStyle> &
  ReturnType<typeof useMeshPointsSizeStyle> &
  ReturnType<typeof useMeshPointsVertexAttributeStyle>;

export function useMeshPointsStyle(): UseMeshPointsStyleReturn {
  const meshPointsCommonStyle = useMeshPointsCommonStyle();
  const meshPointsVisibility = useMeshPointsVisibilityStyle();
  const meshPointsColorStyle = useMeshPointsColorStyle();
  const meshPointsSizeStyle = useMeshPointsSizeStyle();
  const meshPointsVertexAttributeStyle = useMeshPointsVertexAttributeStyle();

  const activeColoringDeps: MeshPointsActiveColoringDeps = {
    commonStyle: meshPointsCommonStyle,
    colorStyle: meshPointsColorStyle,
    vertexAttributeStyle: meshPointsVertexAttributeStyle,
  };

  function meshPointsColoring(id: string): StyleValues {
    return meshPointsCommonStyle.meshPointsColoring(id);
  }

  function meshPointsActiveColoring(id: string): string | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.active is defined as string in the data style schema.
    return meshPointsColoring(id).active as string | undefined;
  }

  async function boundSetMeshPointsActiveColoring(
    id: string,
    type: string | undefined,
  ): Promise<unknown> {
    const result = await setMeshPointsActiveColoring(id, type, activeColoringDeps);
    return result;
  }

  async function boundApplyMeshPointsStyle(id: string): Promise<unknown[]> {
    const result = await applyMeshPointsStyle(
      id,
      meshPointsVisibility,
      meshPointsSizeStyle,
      meshPointsActiveColoring(id),
      activeColoringDeps,
    );
    return result;
  }

  return {
    ...meshPointsCommonStyle,
    meshPointsColoring,
    meshPointsActiveColoring,
    setMeshPointsActiveColoring: boundSetMeshPointsActiveColoring,
    applyMeshPointsStyle: boundApplyMeshPointsStyle,
    ...meshPointsVisibility,
    ...meshPointsColorStyle,
    ...meshPointsSizeStyle,
    ...meshPointsVertexAttributeStyle,
  };
}
