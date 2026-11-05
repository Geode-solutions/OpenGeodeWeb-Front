// Third party imports

// Local imports
import {
  isMeshPolygonsPolygonAttributeValid,
  useMeshPolygonsPolygonAttributeStyle,
} from "./polygon";
import { isMeshPolygonsVertexAttributeValid, useMeshPolygonsVertexAttributeStyle } from "./vertex";
import type { DataId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useMeshPolygonsColorStyle } from "./color";
import { useMeshPolygonsCommonStyle } from "./common";
import { useMeshPolygonsTexturesStyle } from "./textures";
import { useMeshPolygonsVisibilityStyle } from "./visibility";
import { whenDefined } from "@ogw_internal/stores/data_style/when_defined";

// Local constants

interface MeshPolygonsActiveColoringDeps {
  readonly commonStyle: ReturnType<typeof useMeshPolygonsCommonStyle>;
  readonly colorStyle: ReturnType<typeof useMeshPolygonsColorStyle>;
  readonly texturesStyle: ReturnType<typeof useMeshPolygonsTexturesStyle>;
  readonly vertexAttributeStyle: ReturnType<typeof useMeshPolygonsVertexAttributeStyle>;
  readonly polygonAttributeStyle: ReturnType<typeof useMeshPolygonsPolygonAttributeStyle>;
}

function handleMeshPolygonsVertexColoring(
  meshId: DataId,
  vertexAttributeStyle: ReturnType<typeof useMeshPolygonsVertexAttributeStyle>,
): Promise<unknown> | undefined {
  const name = vertexAttributeStyle.meshPolygonsVertexAttributeName(meshId);
  const item = vertexAttributeStyle.meshPolygonsVertexAttributeItem(meshId);
  const [minimum, maximum] = vertexAttributeStyle.meshPolygonsVertexAttributeRange(meshId);
  const colorMap = vertexAttributeStyle.meshPolygonsVertexAttributeColorMap(meshId);
  const no_data_color = vertexAttributeStyle.meshPolygonsVertexAttributeNoDataColor(meshId);
  const vertex_attribute = { name, item, minimum, maximum, colorMap, no_data_color };
  if (!isMeshPolygonsVertexAttributeValid(vertex_attribute)) {
    return undefined;
  }
  return vertexAttributeStyle.setMeshPolygonsVertexAttribute(meshId, vertex_attribute);
}

function handleMeshPolygonsPolygonColoring(
  meshId: DataId,
  polygonAttributeStyle: ReturnType<typeof useMeshPolygonsPolygonAttributeStyle>,
): Promise<unknown> | undefined {
  const name = polygonAttributeStyle.meshPolygonsPolygonAttributeName(meshId);
  const item = polygonAttributeStyle.meshPolygonsPolygonAttributeItem(meshId);
  const [minimum, maximum] = polygonAttributeStyle.meshPolygonsPolygonAttributeRange(meshId);
  const colorMap = polygonAttributeStyle.meshPolygonsPolygonAttributeColorMap(meshId);
  const no_data_color = polygonAttributeStyle.meshPolygonsPolygonAttributeNoDataColor(meshId);
  const polygon_attribute = {
    name,
    item,
    minimum,
    maximum,
    colorMap,
    no_data_color,
  };
  if (!isMeshPolygonsPolygonAttributeValid(polygon_attribute)) {
    return undefined;
  }
  return polygonAttributeStyle.setMeshPolygonsPolygonAttribute(meshId, polygon_attribute);
}

async function applyMeshPolygonsActiveColoring(
  meshId: DataId,
  type: string | undefined,
  deps: MeshPolygonsActiveColoringDeps,
): Promise<unknown> {
  await deps.commonStyle.mutateMeshPolygonsStyle(meshId, {
    coloring: { active: type },
  });
  if (type === "constant") {
    const result = await whenDefined(deps.colorStyle.meshPolygonsColor(meshId), async (value) => {
      const applied = await deps.colorStyle.setMeshPolygonsColor(meshId, value);
      return applied;
    });
    return result;
  }
  if (type === "textures") {
    const textures = deps.texturesStyle.meshPolygonsTextures(meshId);
    // The viewer requires at least one texture: nothing to apply until one is picked.
    if (textures === undefined || textures.length === 0) {
      return undefined;
    }
    const result = await deps.texturesStyle.setMeshPolygonsTextures(meshId, textures);
    return result;
  }
  if (type === "vertex") {
    const result = await handleMeshPolygonsVertexColoring(meshId, deps.vertexAttributeStyle);
    return result;
  }
  if (type === "polygon") {
    const result = await handleMeshPolygonsPolygonColoring(meshId, deps.polygonAttributeStyle);
    return result;
  }
  throw new Error(`Unknown mesh polygons coloring type: ${type}`);
}

async function setMeshPolygonsActiveColoring(
  meshId: DataId,
  type: string | undefined,
  deps: MeshPolygonsActiveColoringDeps,
): Promise<unknown> {
  const result = await applyMeshPolygonsActiveColoring(meshId, type, deps);
  if (type !== "constant") {
    // Attribute and textures colorings keep the actor opacity: restore the stored one
    await whenDefined(deps.colorStyle.meshPolygonsOpacity(meshId), async (value) => {
      const applied = await deps.colorStyle.setMeshPolygonsOpacity(meshId, value);
      return applied;
    });
  }
  return result;
}

async function applyMeshPolygonsStyle(
  meshId: DataId,
  visibilityStyle: ReturnType<typeof useMeshPolygonsVisibilityStyle>,
  activeColoringType: string | undefined,
  deps: MeshPolygonsActiveColoringDeps,
): Promise<unknown[]> {
  const result = await Promise.all([
    whenDefined(visibilityStyle.meshPolygonsVisibility(meshId), async (value) => {
      const applied = await visibilityStyle.setMeshPolygonsVisibility(meshId, value);
      return applied;
    }),
    setMeshPolygonsActiveColoring(meshId, activeColoringType, deps),
  ]);
  return result;
}

type UseMeshPolygonsStyleReturn = ReturnType<typeof useMeshPolygonsCommonStyle> & {
  meshPolygonsColoring: (meshId: DataId) => StyleValues;
  meshPolygonsActiveColoring: (meshId: DataId) => string | undefined;
  setMeshPolygonsActiveColoring: (meshId: DataId, type: string | undefined) => Promise<unknown>;
  applyMeshPolygonsStyle: (meshId: DataId) => Promise<unknown[]>;
} & ReturnType<typeof useMeshPolygonsVisibilityStyle> &
  ReturnType<typeof useMeshPolygonsColorStyle> &
  ReturnType<typeof useMeshPolygonsTexturesStyle> &
  ReturnType<typeof useMeshPolygonsVertexAttributeStyle> &
  ReturnType<typeof useMeshPolygonsPolygonAttributeStyle>;

export function useMeshPolygonsStyle(): UseMeshPolygonsStyleReturn {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
  const meshPolygonsVisibility = useMeshPolygonsVisibilityStyle();
  const meshPolygonsColorStyle = useMeshPolygonsColorStyle();
  const meshPolygonsTexturesStore = useMeshPolygonsTexturesStyle();
  const meshPolygonsVertexAttributeStyle = useMeshPolygonsVertexAttributeStyle();
  const meshPolygonsPolygonAttributeStyle = useMeshPolygonsPolygonAttributeStyle();

  const activeColoringDeps: MeshPolygonsActiveColoringDeps = {
    commonStyle: meshPolygonsCommonStyle,
    colorStyle: meshPolygonsColorStyle,
    texturesStyle: meshPolygonsTexturesStore,
    vertexAttributeStyle: meshPolygonsVertexAttributeStyle,
    polygonAttributeStyle: meshPolygonsPolygonAttributeStyle,
  };

  function meshPolygonsColoring(meshId: DataId): StyleValues {
    return meshPolygonsCommonStyle.meshPolygonsColoring(meshId);
  }

  function meshPolygonsActiveColoring(meshId: DataId): string | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.active is defined as string in the data style schema.
    return meshPolygonsColoring(meshId).active as string | undefined;
  }

  async function boundSetMeshPolygonsActiveColoring(
    meshId: DataId,
    type: string | undefined,
  ): Promise<unknown> {
    const result = await setMeshPolygonsActiveColoring(meshId, type, activeColoringDeps);
    return result;
  }

  async function boundApplyMeshPolygonsStyle(meshId: DataId): Promise<unknown[]> {
    const result = await applyMeshPolygonsStyle(
      meshId,
      meshPolygonsVisibility,
      meshPolygonsActiveColoring(meshId),
      activeColoringDeps,
    );
    return result;
  }

  return {
    ...meshPolygonsCommonStyle,
    meshPolygonsColoring,
    meshPolygonsActiveColoring,
    setMeshPolygonsActiveColoring: boundSetMeshPolygonsActiveColoring,
    applyMeshPolygonsStyle: boundApplyMeshPolygonsStyle,
    ...meshPolygonsVisibility,
    ...meshPolygonsColorStyle,
    ...meshPolygonsTexturesStore,
    ...meshPolygonsVertexAttributeStyle,
    ...meshPolygonsPolygonAttributeStyle,
  };
}
