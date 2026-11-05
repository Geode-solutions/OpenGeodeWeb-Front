// Third party imports

// Local imports
import { isMeshPointsVertexAttributeValid, useMeshPointsVertexAttributeStyle } from "./vertex";
import type { DataId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useMeshPointsColorStyle } from "./color";
import { useMeshPointsCommonStyle } from "./common";
import { useMeshPointsSizeStyle } from "./size";
import { useMeshPointsVisibilityStyle } from "./visibility";
import { whenDefined } from "@ogw_internal/stores/data_style/when_defined";

// Local constants

interface MeshPointsActiveColoringDeps {
  readonly commonStyle: ReturnType<typeof useMeshPointsCommonStyle>;
  readonly colorStyle: ReturnType<typeof useMeshPointsColorStyle>;
  readonly vertexAttributeStyle: ReturnType<typeof useMeshPointsVertexAttributeStyle>;
}

function handleMeshPointsVertexColoring(
  meshId: DataId,
  vertexAttributeStyle: ReturnType<typeof useMeshPointsVertexAttributeStyle>,
): Promise<unknown> | undefined {
  const name = vertexAttributeStyle.meshPointsVertexAttributeName(meshId);
  const item = vertexAttributeStyle.meshPointsVertexAttributeItem(meshId);
  const [minimum, maximum] = vertexAttributeStyle.meshPointsVertexAttributeRange(meshId);
  const colorMap = vertexAttributeStyle.meshPointsVertexAttributeColorMap(meshId);
  const no_data_color = vertexAttributeStyle.meshPointsVertexAttributeNoDataColor(meshId);
  const vertex_attribute = { name, item, minimum, maximum, colorMap, no_data_color };
  if (!isMeshPointsVertexAttributeValid(vertex_attribute)) {
    return undefined;
  }
  return vertexAttributeStyle.setMeshPointsVertexAttribute(meshId, vertex_attribute);
}

async function applyMeshPointsActiveColoring(
  meshId: DataId,
  type: string | undefined,
  deps: MeshPointsActiveColoringDeps,
): Promise<unknown> {
  await deps.commonStyle.mutateMeshPointsStyle(meshId, {
    coloring: { active: type },
  });
  if (type === "constant") {
    const result = await whenDefined(deps.colorStyle.meshPointsColor(meshId), async (value) => {
      const applied = await deps.colorStyle.setMeshPointsColor(meshId, value);
      return applied;
    });
    return result;
  }
  if (type === "vertex") {
    const result = await handleMeshPointsVertexColoring(meshId, deps.vertexAttributeStyle);
    return result;
  }
  throw new Error(`Unknown mesh points coloring type: ${type}`);
}

async function setMeshPointsActiveColoring(
  meshId: DataId,
  type: string | undefined,
  deps: MeshPointsActiveColoringDeps,
): Promise<unknown> {
  const result = await applyMeshPointsActiveColoring(meshId, type, deps);
  if (type !== "constant") {
    // Attribute and textures colorings keep the actor opacity: restore the stored one
    await whenDefined(deps.colorStyle.meshPointsOpacity(meshId), async (value) => {
      const applied = await deps.colorStyle.setMeshPointsOpacity(meshId, value);
      return applied;
    });
  }
  return result;
}

async function applyMeshPointsStyle(
  meshId: DataId,
  visibilityStyle: ReturnType<typeof useMeshPointsVisibilityStyle>,
  sizeStyle: ReturnType<typeof useMeshPointsSizeStyle>,
  activeColoringType: string | undefined,
  deps: MeshPointsActiveColoringDeps,
): Promise<unknown[]> {
  const result = await Promise.all([
    whenDefined(visibilityStyle.meshPointsVisibility(meshId), async (value) => {
      const applied = await visibilityStyle.setMeshPointsVisibility(meshId, value);
      return applied;
    }),
    whenDefined(sizeStyle.meshPointsSize(meshId), async (value) => {
      const applied = await sizeStyle.setMeshPointsSize(meshId, value);
      return applied;
    }),
    setMeshPointsActiveColoring(meshId, activeColoringType, deps),
  ]);
  return result;
}

type UseMeshPointsStyleReturn = ReturnType<typeof useMeshPointsCommonStyle> & {
  meshPointsColoring: (meshId: DataId) => StyleValues;
  meshPointsActiveColoring: (meshId: DataId) => string | undefined;
  setMeshPointsActiveColoring: (meshId: DataId, type: string | undefined) => Promise<unknown>;
  applyMeshPointsStyle: (meshId: DataId) => Promise<unknown[]>;
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

  function meshPointsColoring(meshId: DataId): StyleValues {
    return meshPointsCommonStyle.meshPointsColoring(meshId);
  }

  function meshPointsActiveColoring(meshId: DataId): string | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.active is defined as string in the data style schema.
    return meshPointsColoring(meshId).active as string | undefined;
  }

  async function boundSetMeshPointsActiveColoring(
    meshId: DataId,
    type: string | undefined,
  ): Promise<unknown> {
    const result = await setMeshPointsActiveColoring(meshId, type, activeColoringDeps);
    return result;
  }

  async function boundApplyMeshPointsStyle(meshId: DataId): Promise<unknown[]> {
    const result = await applyMeshPointsStyle(
      meshId,
      meshPointsVisibility,
      meshPointsSizeStyle,
      meshPointsActiveColoring(meshId),
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
