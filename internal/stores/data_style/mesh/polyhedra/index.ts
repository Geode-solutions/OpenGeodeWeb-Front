// Third party imports

// Local imports
import {
  isMeshPolyhedraPolyhedronAttributeValid,
  useMeshPolyhedraPolyhedronAttributeStyle,
} from "./polyhedron";
import {
  isMeshPolyhedraVertexAttributeValid,
  useMeshPolyhedraVertexAttributeStyle,
} from "./vertex";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useMeshPolyhedraColorStyle } from "./color";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useMeshPolyhedraVisibilityStyle } from "./visibility";

// Local constants

interface MeshPolyhedraActiveColoringDeps {
  readonly commonStyle: Readonly<ReturnType<typeof useMeshPolyhedraCommonStyle>>;
  readonly colorStyle: Readonly<ReturnType<typeof useMeshPolyhedraColorStyle>>;
  readonly vertexAttributeStyle: Readonly<ReturnType<typeof useMeshPolyhedraVertexAttributeStyle>>;
  readonly polyhedronAttributeStyle: Readonly<
    ReturnType<typeof useMeshPolyhedraPolyhedronAttributeStyle>
  >;
}

function handleMeshPolyhedraVertexColoring(
  id: string,
  vertexAttributeStyle: Readonly<ReturnType<typeof useMeshPolyhedraVertexAttributeStyle>>,
): Promise<unknown> | undefined {
  const name = vertexAttributeStyle.meshPolyhedraVertexAttributeName(id);
  const item = vertexAttributeStyle.meshPolyhedraVertexAttributeItem(id);
  const [minimum, maximum] = vertexAttributeStyle.meshPolyhedraVertexAttributeRange(id);
  const colorMap = vertexAttributeStyle.meshPolyhedraVertexAttributeColorMap(id);
  const vertex_attribute = { name, item, minimum, maximum, colorMap };
  if (!isMeshPolyhedraVertexAttributeValid(vertex_attribute)) {
    return undefined;
  }
  return vertexAttributeStyle.setMeshPolyhedraVertexAttribute(id, vertex_attribute);
}

function handleMeshPolyhedraPolyhedronColoring(
  id: string,
  polyhedronAttributeStyle: Readonly<ReturnType<typeof useMeshPolyhedraPolyhedronAttributeStyle>>,
): Promise<unknown> | undefined {
  const name = polyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeName(id);
  const item = polyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeItem(id);
  const [minimum, maximum] = polyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeRange(id);
  const colorMap = polyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeColorMap(id);
  const polyhedron_attribute = { name, item, minimum, maximum, colorMap };
  if (!isMeshPolyhedraPolyhedronAttributeValid(polyhedron_attribute)) {
    return undefined;
  }
  return polyhedronAttributeStyle.setMeshPolyhedraPolyhedronAttribute(id, polyhedron_attribute);
}

async function setMeshPolyhedraActiveColoring(
  id: string,
  type: string | undefined,
  deps: Readonly<MeshPolyhedraActiveColoringDeps>,
): Promise<unknown> {
  await deps.commonStyle.mutateMeshPolyhedraStyle(id, {
    coloring: { active: type },
  });
  if (type === "constant") {
    const result = await deps.colorStyle.setMeshPolyhedraColor(
      id,
      deps.colorStyle.meshPolyhedraColor(id),
    );
    return result;
  }
  if (type === "vertex") {
    const result = await handleMeshPolyhedraVertexColoring(id, deps.vertexAttributeStyle);
    return result;
  }
  if (type === "polyhedron") {
    const result = await handleMeshPolyhedraPolyhedronColoring(id, deps.polyhedronAttributeStyle);
    return result;
  }
  throw new Error(`Unknown mesh polyhedra coloring type: ${type}`);
}

async function applyMeshPolyhedraStyle(
  id: string,
  visibilityStyle: Readonly<ReturnType<typeof useMeshPolyhedraVisibilityStyle>>,
  activeColoringType: string | undefined,
  deps: Readonly<MeshPolyhedraActiveColoringDeps>,
): Promise<unknown[]> {
  const result = await Promise.all([
    visibilityStyle.setMeshPolyhedraVisibility(id, visibilityStyle.meshPolyhedraVisibility(id)),
    setMeshPolyhedraActiveColoring(id, activeColoringType, deps),
  ]);
  return result;
}

type UseMeshPolyhedraStyleReturn = ReturnType<typeof useMeshPolyhedraCommonStyle> & {
  meshPolyhedraColoring: (id: string) => StyleValues;
  meshPolyhedraActiveColoring: (id: string) => string | undefined;
  setMeshPolyhedraActiveColoring: (id: string, type: string | undefined) => Promise<unknown>;
  applyMeshPolyhedraStyle: (id: string) => Promise<unknown[]>;
} & ReturnType<typeof useMeshPolyhedraVisibilityStyle> &
  ReturnType<typeof useMeshPolyhedraColorStyle> &
  ReturnType<typeof useMeshPolyhedraVertexAttributeStyle> &
  ReturnType<typeof useMeshPolyhedraPolyhedronAttributeStyle>;

export function useMeshPolyhedraStyle(): UseMeshPolyhedraStyleReturn {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  const meshPolyhedraVisibility = useMeshPolyhedraVisibilityStyle();
  const meshPolyhedraColorStyle = useMeshPolyhedraColorStyle();
  const meshPolyhedraVertexAttributeStyle = useMeshPolyhedraVertexAttributeStyle();
  const meshPolyhedraPolyhedronAttributeStyle = useMeshPolyhedraPolyhedronAttributeStyle();

  const activeColoringDeps: MeshPolyhedraActiveColoringDeps = {
    commonStyle: meshPolyhedraCommonStyle,
    colorStyle: meshPolyhedraColorStyle,
    vertexAttributeStyle: meshPolyhedraVertexAttributeStyle,
    polyhedronAttributeStyle: meshPolyhedraPolyhedronAttributeStyle,
  };

  function meshPolyhedraColoring(id: string): StyleValues {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id);
  }

  function meshPolyhedraActiveColoring(id: string): string | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.active is defined as string in the data style schema.
    return meshPolyhedraColoring(id).active as string | undefined;
  }

  async function boundSetMeshPolyhedraActiveColoring(
    id: string,
    type: string | undefined,
  ): Promise<unknown> {
    const result = await setMeshPolyhedraActiveColoring(id, type, activeColoringDeps);
    return result;
  }

  async function boundApplyMeshPolyhedraStyle(id: string): Promise<unknown[]> {
    const result = await applyMeshPolyhedraStyle(
      id,
      meshPolyhedraVisibility,
      meshPolyhedraActiveColoring(id),
      activeColoringDeps,
    );
    return result;
  }

  return {
    ...meshPolyhedraCommonStyle,
    meshPolyhedraColoring,
    meshPolyhedraActiveColoring,
    setMeshPolyhedraActiveColoring: boundSetMeshPolyhedraActiveColoring,
    applyMeshPolyhedraStyle: boundApplyMeshPolyhedraStyle,
    ...meshPolyhedraVisibility,
    ...meshPolyhedraColorStyle,
    ...meshPolyhedraVertexAttributeStyle,
    ...meshPolyhedraPolyhedronAttributeStyle,
  };
}
