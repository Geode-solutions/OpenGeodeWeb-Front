// Third party imports

// Local imports
import { isMeshCellsCellAttributeValid, useMeshCellsCellAttributeStyle } from "./cell";
import { isMeshCellsVertexAttributeValid, useMeshCellsVertexAttributeStyle } from "./vertex";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useMeshCellsColorStyle } from "./color";
import { useMeshCellsCommonStyle } from "./common";
import { useMeshCellsTexturesStyle } from "./textures";
import { useMeshCellsVisibilityStyle } from "./visibility";

// Local constants

interface MeshCellsActiveColoringDeps {
  readonly commonStyle: Readonly<ReturnType<typeof useMeshCellsCommonStyle>>;
  readonly colorStyle: Readonly<ReturnType<typeof useMeshCellsColorStyle>>;
  readonly texturesStyle: Readonly<ReturnType<typeof useMeshCellsTexturesStyle>>;
  readonly vertexAttributeStyle: Readonly<ReturnType<typeof useMeshCellsVertexAttributeStyle>>;
  readonly cellAttributeStyle: Readonly<ReturnType<typeof useMeshCellsCellAttributeStyle>>;
}

function handleMeshCellsVertexColoring(
  id: string,
  vertexAttributeStyle: Readonly<ReturnType<typeof useMeshCellsVertexAttributeStyle>>,
): Promise<unknown> | undefined {
  const name = vertexAttributeStyle.meshCellsVertexAttributeName(id);
  const item = vertexAttributeStyle.meshCellsVertexAttributeItem(id);
  const [minimum, maximum] = vertexAttributeStyle.meshCellsVertexAttributeRange(id);
  const colorMap = vertexAttributeStyle.meshCellsVertexAttributeColorMap(id);
  const vertex_attribute = { name, item, minimum, maximum, colorMap };
  if (!isMeshCellsVertexAttributeValid(vertex_attribute)) {
    return undefined;
  }
  return vertexAttributeStyle.setMeshCellsVertexAttribute(id, vertex_attribute);
}

function handleMeshCellsCellColoring(
  id: string,
  cellAttributeStyle: Readonly<ReturnType<typeof useMeshCellsCellAttributeStyle>>,
): Promise<unknown> | undefined {
  const name = cellAttributeStyle.meshCellsCellAttributeName(id);
  const item = cellAttributeStyle.meshCellsCellAttributeItem(id);
  const [minimum, maximum] = cellAttributeStyle.meshCellsCellAttributeRange(id);
  const colorMap = cellAttributeStyle.meshCellsCellAttributeColorMap(id);
  const cell_attribute = { name, item, minimum, maximum, colorMap };
  if (!isMeshCellsCellAttributeValid(cell_attribute)) {
    return undefined;
  }
  return cellAttributeStyle.setMeshCellsCellAttribute(id, cell_attribute);
}

async function setMeshCellsActiveColoring(
  id: string,
  type: string | undefined,
  deps: Readonly<MeshCellsActiveColoringDeps>,
): Promise<unknown> {
  await deps.commonStyle.mutateMeshCellsStyle(id, {
    coloring: { active: type },
  });
  if (type === "constant") {
    const result = await deps.colorStyle.setMeshCellsColor(id, deps.colorStyle.meshCellsColor(id));
    return result;
  }
  if (type === "textures") {
    const result = await deps.texturesStyle.setMeshCellsTextures(
      id,
      deps.texturesStyle.meshCellsTextures(id),
    );
    return result;
  }
  if (type === "vertex") {
    const result = await handleMeshCellsVertexColoring(id, deps.vertexAttributeStyle);
    return result;
  }
  if (type === "cell") {
    const result = await handleMeshCellsCellColoring(id, deps.cellAttributeStyle);
    return result;
  }
  throw new Error(`Unknown mesh cells coloring type: ${type}`);
}

async function applyMeshCellsStyle(
  id: string,
  visibilityStyle: Readonly<ReturnType<typeof useMeshCellsVisibilityStyle>>,
  activeColoringType: string | undefined,
  deps: Readonly<MeshCellsActiveColoringDeps>,
): Promise<unknown[]> {
  const result = await Promise.all([
    visibilityStyle.setMeshCellsVisibility(id, visibilityStyle.meshCellsVisibility(id)),
    setMeshCellsActiveColoring(id, activeColoringType, deps),
  ]);
  return result;
}

type UseMeshCellsStyleReturn = ReturnType<typeof useMeshCellsCommonStyle> & {
  meshCellsColoring: (id: string) => StyleValues;
  meshCellsActiveColoring: (id: string) => string | undefined;
  setMeshCellsActiveColoring: (id: string, type: string | undefined) => Promise<unknown>;
  applyMeshCellsStyle: (id: string) => Promise<unknown[]>;
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

  function meshCellsColoring(id: string): StyleValues {
    return meshCellsCommonStyle.meshCellsColoring(id);
  }

  function meshCellsActiveColoring(id: string): string | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.active is defined as string in the data style schema.
    return meshCellsColoring(id).active as string | undefined;
  }

  async function boundSetMeshCellsActiveColoring(
    id: string,
    type: string | undefined,
  ): Promise<unknown> {
    const result = await setMeshCellsActiveColoring(id, type, activeColoringDeps);
    return result;
  }

  async function boundApplyMeshCellsStyle(id: string): Promise<unknown[]> {
    const result = await applyMeshCellsStyle(
      id,
      meshCellsVisibility,
      meshCellsActiveColoring(id),
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
