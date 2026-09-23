// Third party imports

// Local imports
import {
  isMeshPolygonsPolygonAttributeValid,
  useMeshPolygonsPolygonAttributeStyle,
} from "./polygon";
import { isMeshPolygonsVertexAttributeValid, useMeshPolygonsVertexAttributeStyle } from "./vertex";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useMeshPolygonsColorStyle } from "./color";
import { useMeshPolygonsCommonStyle } from "./common";
import { useMeshPolygonsTexturesStyle } from "./textures";
import { useMeshPolygonsVisibilityStyle } from "./visibility";

// Local constants

interface MeshPolygonsActiveColoringDeps {
  readonly commonStyle: ReturnType<typeof useMeshPolygonsCommonStyle>;
  readonly colorStyle: ReturnType<typeof useMeshPolygonsColorStyle>;
  readonly texturesStyle: ReturnType<typeof useMeshPolygonsTexturesStyle>;
  readonly vertexAttributeStyle: ReturnType<typeof useMeshPolygonsVertexAttributeStyle>;
  readonly polygonAttributeStyle: ReturnType<typeof useMeshPolygonsPolygonAttributeStyle>;
}

function handleMeshPolygonsVertexColoring(
  id: string,
  vertexAttributeStyle: ReturnType<typeof useMeshPolygonsVertexAttributeStyle>,
): Promise<unknown> | undefined {
  const name = vertexAttributeStyle.meshPolygonsVertexAttributeName(id);
  const item = vertexAttributeStyle.meshPolygonsVertexAttributeItem(id);
  const [minimum, maximum] = vertexAttributeStyle.meshPolygonsVertexAttributeRange(id);
  const colorMap = vertexAttributeStyle.meshPolygonsVertexAttributeColorMap(id);
  const vertex_attribute = { name, item, minimum, maximum, colorMap };
  if (!isMeshPolygonsVertexAttributeValid(vertex_attribute)) {
    return undefined;
  }
  return vertexAttributeStyle.setMeshPolygonsVertexAttribute(id, vertex_attribute);
}

function handleMeshPolygonsPolygonColoring(
  id: string,
  polygonAttributeStyle: ReturnType<typeof useMeshPolygonsPolygonAttributeStyle>,
): Promise<unknown> | undefined {
  const name = polygonAttributeStyle.meshPolygonsPolygonAttributeName(id);
  const item = polygonAttributeStyle.meshPolygonsPolygonAttributeItem(id);
  const [minimum, maximum] = polygonAttributeStyle.meshPolygonsPolygonAttributeRange(id);
  const colorMap = polygonAttributeStyle.meshPolygonsPolygonAttributeColorMap(id);
  const polygon_attribute = { name, item, minimum, maximum, colorMap };
  if (!isMeshPolygonsPolygonAttributeValid(polygon_attribute)) {
    return undefined;
  }
  return polygonAttributeStyle.setMeshPolygonsPolygonAttribute(id, polygon_attribute);
}

async function setMeshPolygonsActiveColoring(
  id: string,
  type: string | undefined,
  deps: MeshPolygonsActiveColoringDeps,
): Promise<unknown> {
  await deps.commonStyle.mutateMeshPolygonsStyle(id, {
    coloring: { active: type },
  });
  if (type === "constant") {
    const result = await deps.colorStyle.setMeshPolygonsColor(
      id,
      deps.colorStyle.meshPolygonsColor(id),
    );
    return result;
  }
  if (type === "textures") {
    const result = await deps.texturesStyle.setMeshPolygonsTextures(
      id,
      deps.texturesStyle.meshPolygonsTextures(id),
    );
    return result;
  }
  if (type === "vertex") {
    const result = await handleMeshPolygonsVertexColoring(id, deps.vertexAttributeStyle);
    return result;
  }
  if (type === "polygon") {
    const result = await handleMeshPolygonsPolygonColoring(id, deps.polygonAttributeStyle);
    return result;
  }
  throw new Error(`Unknown mesh polygons coloring type: ${type}`);
}

async function applyMeshPolygonsStyle(
  id: string,
  visibilityStyle: ReturnType<typeof useMeshPolygonsVisibilityStyle>,
  activeColoringType: string | undefined,
  deps: MeshPolygonsActiveColoringDeps,
): Promise<unknown[]> {
  const result = await Promise.all([
    visibilityStyle.setMeshPolygonsVisibility(id, visibilityStyle.meshPolygonsVisibility(id)),
    setMeshPolygonsActiveColoring(id, activeColoringType, deps),
  ]);
  return result;
}

type UseMeshPolygonsStyleReturn = ReturnType<typeof useMeshPolygonsCommonStyle> & {
  meshPolygonsColoring: (id: string) => StyleValues;
  meshPolygonsActiveColoring: (id: string) => string | undefined;
  setMeshPolygonsActiveColoring: (id: string, type: string | undefined) => Promise<unknown>;
  applyMeshPolygonsStyle: (id: string) => Promise<unknown[]>;
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

  function meshPolygonsColoring(id: string): StyleValues {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id);
  }

  function meshPolygonsActiveColoring(id: string): string | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.active is defined as string in the data style schema.
    return meshPolygonsColoring(id).active as string | undefined;
  }

  async function boundSetMeshPolygonsActiveColoring(
    id: string,
    type: string | undefined,
  ): Promise<unknown> {
    const result = await setMeshPolygonsActiveColoring(id, type, activeColoringDeps);
    return result;
  }

  async function boundApplyMeshPolygonsStyle(id: string): Promise<unknown[]> {
    const result = await applyMeshPolygonsStyle(
      id,
      meshPolygonsVisibility,
      meshPolygonsActiveColoring(id),
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
