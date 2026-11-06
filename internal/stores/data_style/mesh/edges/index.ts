// Third party imports

// Local imports
import type { DataId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import { useMeshEdgesColorStyle } from "./color";
import { useMeshEdgesCommonStyle } from "./common";
import { useMeshEdgesEdgeAttributeStyle } from "./edge";
import { useMeshEdgesVertexAttributeStyle } from "./vertex";
import { useMeshEdgesVisibilityStyle } from "./visibility";
import { useMeshEdgesWidthStyle } from "./width";
import { whenDefined } from "@ogw_internal/stores/data_style/when_defined";

// Local constants

interface MeshEdgesActiveColoringDeps {
  readonly commonStyle: ReturnType<typeof useMeshEdgesCommonStyle>;
  readonly colorStyle: ReturnType<typeof useMeshEdgesColorStyle>;
  readonly vertexAttributeStyle: ReturnType<typeof useMeshEdgesVertexAttributeStyle>;
  readonly edgeAttributeStyle: ReturnType<typeof useMeshEdgesEdgeAttributeStyle>;
}

function handleMeshEdgesVertexColoring(
  meshId: DataId,
  vertexAttributeStyle: ReturnType<typeof useMeshEdgesVertexAttributeStyle>,
): Promise<unknown> | undefined {
  const name = vertexAttributeStyle.meshEdgesVertexAttributeName(meshId);
  const item = vertexAttributeStyle.meshEdgesVertexAttributeItem(meshId);
  const [minimum, maximum] = vertexAttributeStyle.meshEdgesVertexAttributeRange(meshId);
  const colorMap = vertexAttributeStyle.meshEdgesVertexAttributeColorMap(meshId);
  const no_data_color = vertexAttributeStyle.meshEdgesVertexAttributeNoDataColor(meshId);
  const vertex_attribute = { name, item, minimum, maximum, colorMap, no_data_color };
  if (!isAttributeValid(vertex_attribute)) {
    return undefined;
  }
  return vertexAttributeStyle.setMeshEdgesVertexAttribute(meshId, vertex_attribute);
}

function handleMeshEdgesEdgeColoring(
  meshId: DataId,
  edgeAttributeStyle: ReturnType<typeof useMeshEdgesEdgeAttributeStyle>,
): Promise<unknown> | undefined {
  const name = edgeAttributeStyle.meshEdgesEdgeAttributeName(meshId);
  const item = edgeAttributeStyle.meshEdgesEdgeAttributeItem(meshId);
  const [minimum, maximum] = edgeAttributeStyle.meshEdgesEdgeAttributeRange(meshId);
  const colorMap = edgeAttributeStyle.meshEdgesEdgeAttributeColorMap(meshId);
  const no_data_color = edgeAttributeStyle.meshEdgesEdgeAttributeNoDataColor(meshId);
  const edge_attribute = { name, item, minimum, maximum, colorMap, no_data_color };
  if (!isAttributeValid(edge_attribute)) {
    return undefined;
  }
  return edgeAttributeStyle.setMeshEdgesEdgeAttribute(meshId, edge_attribute);
}

async function applyMeshEdgesActiveColoring(
  meshId: DataId,
  type: string | undefined,
  deps: MeshEdgesActiveColoringDeps,
): Promise<unknown> {
  await deps.commonStyle.mutateMeshEdgesStyle(meshId, {
    coloring: { active: type },
  });
  if (type === "constant") {
    const result = await whenDefined(deps.colorStyle.meshEdgesColor(meshId), async (value) => {
      const applied = await deps.colorStyle.setMeshEdgesColor(meshId, value);
      return applied;
    });
    return result;
  }
  if (type === "vertex") {
    const result = await handleMeshEdgesVertexColoring(meshId, deps.vertexAttributeStyle);
    return result;
  }
  if (type === "edge") {
    const result = await handleMeshEdgesEdgeColoring(meshId, deps.edgeAttributeStyle);
    return result;
  }
  throw new Error(`Unknown mesh edges coloring type: ${type}`);
}

async function setMeshEdgesActiveColoring(
  meshId: DataId,
  type: string | undefined,
  deps: MeshEdgesActiveColoringDeps,
): Promise<unknown> {
  const result = await applyMeshEdgesActiveColoring(meshId, type, deps);
  if (type !== "constant") {
    // Attribute and textures colorings keep the actor opacity: restore the stored one
    await whenDefined(deps.colorStyle.meshEdgesOpacity(meshId), async (value) => {
      const applied = await deps.colorStyle.setMeshEdgesOpacity(meshId, value);
      return applied;
    });
  }
  return result;
}

async function applyMeshEdgesStyle(
  meshId: DataId,
  visibilityStyle: ReturnType<typeof useMeshEdgesVisibilityStyle>,
  widthStyle: ReturnType<typeof useMeshEdgesWidthStyle>,
  activeColoringType: string | undefined,
  deps: MeshEdgesActiveColoringDeps,
): Promise<unknown[]> {
  const result = await Promise.all([
    whenDefined(visibilityStyle.meshEdgesVisibility(meshId), async (value) => {
      const applied = await visibilityStyle.setMeshEdgesVisibility(meshId, value);
      return applied;
    }),
    whenDefined(widthStyle.meshEdgesWidth(meshId), async (value) => {
      const applied = await widthStyle.setMeshEdgesWidth(meshId, value);
      return applied;
    }),
    setMeshEdgesActiveColoring(meshId, activeColoringType, deps),
  ]);
  return result;
}

type UseMeshEdgesStyleReturn = ReturnType<typeof useMeshEdgesCommonStyle> & {
  meshEdgesColoring: (meshId: DataId) => StyleValues;
  meshEdgesActiveColoring: (meshId: DataId) => string | undefined;
  setMeshEdgesActiveColoring: (meshId: DataId, type: string | undefined) => Promise<unknown>;
  applyMeshEdgesStyle: (meshId: DataId) => Promise<unknown[]>;
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

  function meshEdgesColoring(meshId: DataId): StyleValues {
    return meshEdgesCommonStyle.meshEdgesColoring(meshId);
  }

  function meshEdgesActiveColoring(meshId: DataId): string | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.active is defined as string in the data style schema.
    return meshEdgesColoring(meshId).active as string | undefined;
  }

  async function boundSetMeshEdgesActiveColoring(
    meshId: DataId,
    type: string | undefined,
  ): Promise<unknown> {
    const result = await setMeshEdgesActiveColoring(meshId, type, activeColoringDeps);
    return result;
  }

  async function boundApplyMeshEdgesStyle(meshId: DataId): Promise<unknown[]> {
    const result = await applyMeshEdgesStyle(
      meshId,
      meshEdgesVisibility,
      meshEdgesWidthStyle,
      meshEdgesActiveColoring(meshId),
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
