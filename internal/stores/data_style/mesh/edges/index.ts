// Third party imports

// Local imports
import { isMeshEdgesEdgeAttributeValid, useMeshEdgesEdgeAttributeStyle } from "./edge";
import { isMeshEdgesVertexAttributeValid, useMeshEdgesVertexAttributeStyle } from "./vertex";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useMeshEdgesColorStyle } from "./color";
import { useMeshEdgesCommonStyle } from "./common";
import { useMeshEdgesVisibilityStyle } from "./visibility";
import { useMeshEdgesWidthStyle } from "./width";

// Local constants

interface MeshEdgesActiveColoringDeps {
  readonly commonStyle: Readonly<ReturnType<typeof useMeshEdgesCommonStyle>>;
  readonly colorStyle: Readonly<ReturnType<typeof useMeshEdgesColorStyle>>;
  readonly vertexAttributeStyle: Readonly<ReturnType<typeof useMeshEdgesVertexAttributeStyle>>;
  readonly edgeAttributeStyle: Readonly<ReturnType<typeof useMeshEdgesEdgeAttributeStyle>>;
}

function handleMeshEdgesVertexColoring(
  id: string,
  vertexAttributeStyle: Readonly<ReturnType<typeof useMeshEdgesVertexAttributeStyle>>,
): Promise<unknown> | undefined {
  const name = vertexAttributeStyle.meshEdgesVertexAttributeName(id);
  const item = vertexAttributeStyle.meshEdgesVertexAttributeItem(id);
  const [minimum, maximum] = vertexAttributeStyle.meshEdgesVertexAttributeRange(id);
  const colorMap = vertexAttributeStyle.meshEdgesVertexAttributeColorMap(id);
  const vertex_attribute = { name, item, minimum, maximum, colorMap };
  if (!isMeshEdgesVertexAttributeValid(vertex_attribute)) {
    return undefined;
  }
  return vertexAttributeStyle.setMeshEdgesVertexAttribute(id, vertex_attribute);
}

function handleMeshEdgesEdgeColoring(
  id: string,
  edgeAttributeStyle: Readonly<ReturnType<typeof useMeshEdgesEdgeAttributeStyle>>,
): Promise<unknown> | undefined {
  const name = edgeAttributeStyle.meshEdgesEdgeAttributeName(id);
  const item = edgeAttributeStyle.meshEdgesEdgeAttributeItem(id);
  const [minimum, maximum] = edgeAttributeStyle.meshEdgesEdgeAttributeRange(id);
  const colorMap = edgeAttributeStyle.meshEdgesEdgeAttributeColorMap(id);
  const edge_attribute = { name, item, minimum, maximum, colorMap };
  if (!isMeshEdgesEdgeAttributeValid(edge_attribute)) {
    return undefined;
  }
  return edgeAttributeStyle.setMeshEdgesEdgeAttribute(id, edge_attribute);
}

async function setMeshEdgesActiveColoring(
  id: string,
  type: string | undefined,
  deps: Readonly<MeshEdgesActiveColoringDeps>,
): Promise<unknown> {
  await deps.commonStyle.mutateMeshEdgesStyle(id, {
    coloring: { active: type },
  });
  if (type === "constant") {
    const result = await deps.colorStyle.setMeshEdgesColor(id, deps.colorStyle.meshEdgesColor(id));
    return result;
  }
  if (type === "vertex") {
    const result = await handleMeshEdgesVertexColoring(id, deps.vertexAttributeStyle);
    return result;
  }
  if (type === "edge") {
    const result = await handleMeshEdgesEdgeColoring(id, deps.edgeAttributeStyle);
    return result;
  }
  throw new Error(`Unknown mesh edges coloring type: ${type}`);
}

async function applyMeshEdgesStyle(
  id: string,
  visibilityStyle: Readonly<ReturnType<typeof useMeshEdgesVisibilityStyle>>,
  widthStyle: Readonly<ReturnType<typeof useMeshEdgesWidthStyle>>,
  activeColoringType: string | undefined,
  deps: Readonly<MeshEdgesActiveColoringDeps>,
): Promise<unknown[]> {
  const result = await Promise.all([
    visibilityStyle.setMeshEdgesVisibility(id, visibilityStyle.meshEdgesVisibility(id)),
    widthStyle.setMeshEdgesWidth(id, widthStyle.meshEdgesWidth(id)),
    setMeshEdgesActiveColoring(id, activeColoringType, deps),
  ]);
  return result;
}

type UseMeshEdgesStyleReturn = ReturnType<typeof useMeshEdgesCommonStyle> & {
  meshEdgesColoring: (id: string) => StyleValues;
  meshEdgesActiveColoring: (id: string) => string | undefined;
  setMeshEdgesActiveColoring: (id: string, type: string | undefined) => Promise<unknown>;
  applyMeshEdgesStyle: (id: string) => Promise<unknown[]>;
} & ReturnType<typeof useMeshEdgesVisibilityStyle> &
  ReturnType<typeof useMeshEdgesColorStyle> &
  ReturnType<typeof useMeshEdgesWidthStyle> &
  ReturnType<typeof useMeshEdgesVertexAttributeStyle> &
  ReturnType<typeof useMeshEdgesEdgeAttributeStyle>;

export function useMeshEdgesStyle(): UseMeshEdgesStyleReturn {
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
  const meshEdgesVisibility = useMeshEdgesVisibilityStyle();
  const meshEdgesColorStyle = useMeshEdgesColorStyle();
  const meshEdgesWidthStyle = useMeshEdgesWidthStyle();
  const meshEdgesVertexAttributeStyle = useMeshEdgesVertexAttributeStyle();
  const meshEdgesEdgeAttributeStyle = useMeshEdgesEdgeAttributeStyle();

  const activeColoringDeps: MeshEdgesActiveColoringDeps = {
    commonStyle: meshEdgesCommonStyle,
    colorStyle: meshEdgesColorStyle,
    vertexAttributeStyle: meshEdgesVertexAttributeStyle,
    edgeAttributeStyle: meshEdgesEdgeAttributeStyle,
  };

  function meshEdgesColoring(id: string): StyleValues {
    return meshEdgesCommonStyle.meshEdgesColoring(id);
  }

  function meshEdgesActiveColoring(id: string): string | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.active is defined as string in the data style schema.
    return meshEdgesColoring(id).active as string | undefined;
  }

  async function boundSetMeshEdgesActiveColoring(
    id: string,
    type: string | undefined,
  ): Promise<unknown> {
    const result = await setMeshEdgesActiveColoring(id, type, activeColoringDeps);
    return result;
  }

  async function boundApplyMeshEdgesStyle(id: string): Promise<unknown[]> {
    const result = await applyMeshEdgesStyle(
      id,
      meshEdgesVisibility,
      meshEdgesWidthStyle,
      meshEdgesActiveColoring(id),
      activeColoringDeps,
    );
    return result;
  }

  return {
    ...meshEdgesCommonStyle,
    meshEdgesColoring,
    meshEdgesActiveColoring,
    setMeshEdgesActiveColoring: boundSetMeshEdgesActiveColoring,
    applyMeshEdgesStyle: boundApplyMeshEdgesStyle,
    ...meshEdgesVisibility,
    ...meshEdgesColorStyle,
    ...meshEdgesWidthStyle,
    ...meshEdgesVertexAttributeStyle,
    ...meshEdgesEdgeAttributeStyle,
  };
}
