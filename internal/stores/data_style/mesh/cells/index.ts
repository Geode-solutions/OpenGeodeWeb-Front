// Third party imports

// Local imports
import { isMeshCellsCellAttributeValid, useMeshCellsCellAttributeStyle } from "./cell";
import { isMeshCellsVertexAttributeValid, useMeshCellsVertexAttributeStyle } from "./vertex";
import type { DataId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useMeshCellsColorStyle } from "./color";
import { useMeshCellsCommonStyle } from "./common";
import { useMeshCellsTexturesStyle } from "./textures";
import { useMeshCellsVisibilityStyle } from "./visibility";
import { whenDefined } from "@ogw_internal/stores/data_style/when_defined";

// Local constants

interface MeshCellsActiveColoringDeps {
  readonly commonStyle: ReturnType<typeof useMeshCellsCommonStyle>;
  readonly colorStyle: ReturnType<typeof useMeshCellsColorStyle>;
  readonly texturesStyle: ReturnType<typeof useMeshCellsTexturesStyle>;
  readonly vertexAttributeStyle: ReturnType<typeof useMeshCellsVertexAttributeStyle>;
  readonly cellAttributeStyle: ReturnType<typeof useMeshCellsCellAttributeStyle>;
}

function handleMeshCellsVertexColoring(
  meshId: DataId,
  vertexAttributeStyle: ReturnType<typeof useMeshCellsVertexAttributeStyle>,
): Promise<unknown> | undefined {
  const name = vertexAttributeStyle.meshCellsVertexAttributeName(meshId);
  const item = vertexAttributeStyle.meshCellsVertexAttributeItem(meshId);
  const [minimum, maximum] = vertexAttributeStyle.meshCellsVertexAttributeRange(meshId);
  const colorMap = vertexAttributeStyle.meshCellsVertexAttributeColorMap(meshId);
  const no_data_color = vertexAttributeStyle.meshCellsVertexAttributeNoDataColor(meshId);
  const vertex_attribute = { name, item, minimum, maximum, colorMap, no_data_color };
  if (!isMeshCellsVertexAttributeValid(vertex_attribute)) {
    return undefined;
  }
  return vertexAttributeStyle.setMeshCellsVertexAttribute(meshId, vertex_attribute);
}

function handleMeshCellsCellColoring(
  meshId: DataId,
  cellAttributeStyle: ReturnType<typeof useMeshCellsCellAttributeStyle>,
): Promise<unknown> | undefined {
  const name = cellAttributeStyle.meshCellsCellAttributeName(meshId);
  const item = cellAttributeStyle.meshCellsCellAttributeItem(meshId);
  const [minimum, maximum] = cellAttributeStyle.meshCellsCellAttributeRange(meshId);
  const colorMap = cellAttributeStyle.meshCellsCellAttributeColorMap(meshId);
  const no_data_color = cellAttributeStyle.meshCellsCellAttributeNoDataColor(meshId);
  const cell_attribute = { name, item, minimum, maximum, colorMap, no_data_color };
  if (!isMeshCellsCellAttributeValid(cell_attribute)) {
    return undefined;
  }
  return cellAttributeStyle.setMeshCellsCellAttribute(meshId, cell_attribute);
}

async function applyMeshCellsActiveColoring(
  meshId: DataId,
  type: string | undefined,
  deps: MeshCellsActiveColoringDeps,
): Promise<unknown> {
  await deps.commonStyle.mutateMeshCellsStyle(meshId, {
    coloring: { active: type },
  });
  if (type === "constant") {
    const result = await whenDefined(deps.colorStyle.meshCellsColor(meshId), async (value) => {
      const applied = await deps.colorStyle.setMeshCellsColor(meshId, value);
      return applied;
    });
    return result;
  }
  if (type === "textures") {
    const textures = deps.texturesStyle.meshCellsTextures(meshId);
    // The viewer requires at least one texture: nothing to apply until one is picked.
    if (textures === undefined || textures.length === 0) {
      return undefined;
    }
    const result = await deps.texturesStyle.setMeshCellsTextures(meshId, textures);
    return result;
  }
  if (type === "vertex") {
    const result = await handleMeshCellsVertexColoring(meshId, deps.vertexAttributeStyle);
    return result;
  }
  if (type === "cell") {
    const result = await handleMeshCellsCellColoring(meshId, deps.cellAttributeStyle);
    return result;
  }
  throw new Error(`Unknown mesh cells coloring type: ${type}`);
}

async function setMeshCellsActiveColoring(
  meshId: DataId,
  type: string | undefined,
  deps: MeshCellsActiveColoringDeps,
): Promise<unknown> {
  const result = await applyMeshCellsActiveColoring(meshId, type, deps);
  if (type !== "constant") {
    // Attribute and textures colorings keep the actor opacity: restore the stored one
    await whenDefined(deps.colorStyle.meshCellsOpacity(meshId), async (value) => {
      const applied = await deps.colorStyle.setMeshCellsOpacity(meshId, value);
      return applied;
    });
  }
  return result;
}

async function applyMeshCellsStyle(
  meshId: DataId,
  visibilityStyle: ReturnType<typeof useMeshCellsVisibilityStyle>,
  activeColoringType: string | undefined,
  deps: MeshCellsActiveColoringDeps,
): Promise<unknown[]> {
  const result = await Promise.all([
    whenDefined(visibilityStyle.meshCellsVisibility(meshId), async (value) => {
      const applied = await visibilityStyle.setMeshCellsVisibility(meshId, value);
      return applied;
    }),
    setMeshCellsActiveColoring(meshId, activeColoringType, deps),
  ]);
  return result;
}

type UseMeshCellsStyleReturn = ReturnType<typeof useMeshCellsCommonStyle> & {
  meshCellsColoring: (meshId: DataId) => StyleValues;
  meshCellsActiveColoring: (meshId: DataId) => string | undefined;
  setMeshCellsActiveColoring: (meshId: DataId, type: string | undefined) => Promise<unknown>;
  applyMeshCellsStyle: (meshId: DataId) => Promise<unknown[]>;
} & ReturnType<typeof useMeshCellsVisibilityStyle> &
  ReturnType<typeof useMeshCellsColorStyle> &
  ReturnType<typeof useMeshCellsTexturesStyle> &
  ReturnType<typeof useMeshCellsVertexAttributeStyle> &
  ReturnType<typeof useMeshCellsCellAttributeStyle>;

export function useMeshCellsStyle(): UseMeshCellsStyleReturn {
  const meshCellsCommonStyle = useMeshCellsCommonStyle();
  const meshCellsVisibility = useMeshCellsVisibilityStyle();
  const meshCellsColorStyle = useMeshCellsColorStyle();
  const meshCellsTexturesStore = useMeshCellsTexturesStyle();
  const meshCellsVertexAttributeStyle = useMeshCellsVertexAttributeStyle();
  const meshCellsCellAttributeStyle = useMeshCellsCellAttributeStyle();

  const activeColoringDeps: MeshCellsActiveColoringDeps = {
    commonStyle: meshCellsCommonStyle,
    colorStyle: meshCellsColorStyle,
    texturesStyle: meshCellsTexturesStore,
    vertexAttributeStyle: meshCellsVertexAttributeStyle,
    cellAttributeStyle: meshCellsCellAttributeStyle,
  };

  function meshCellsColoring(meshId: DataId): StyleValues {
    return meshCellsCommonStyle.meshCellsColoring(meshId);
  }

  function meshCellsActiveColoring(meshId: DataId): string | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.active is defined as string in the data style schema.
    return meshCellsColoring(meshId).active as string | undefined;
  }

  async function boundSetMeshCellsActiveColoring(
    meshId: DataId,
    type: string | undefined,
  ): Promise<unknown> {
    const result = await setMeshCellsActiveColoring(meshId, type, activeColoringDeps);
    return result;
  }

  async function boundApplyMeshCellsStyle(meshId: DataId): Promise<unknown[]> {
    const result = await applyMeshCellsStyle(
      meshId,
      meshCellsVisibility,
      meshCellsActiveColoring(meshId),
      activeColoringDeps,
    );
    return result;
  }

  return {
    ...meshCellsCommonStyle,
    meshCellsColoring,
    meshCellsActiveColoring,
    setMeshCellsActiveColoring: boundSetMeshCellsActiveColoring,
    applyMeshCellsStyle: boundApplyMeshCellsStyle,
    ...meshCellsVisibility,
    ...meshCellsColorStyle,
    ...meshCellsTexturesStore,
    ...meshCellsVertexAttributeStyle,
    ...meshCellsCellAttributeStyle,
  };
}
