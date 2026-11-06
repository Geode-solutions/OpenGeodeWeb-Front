// Third party imports

// Local imports
import type { DataId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import { useMeshPolyhedraColorStyle } from "./color";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useMeshPolyhedraPolyhedronAttributeStyle } from "./polyhedron";
import { useMeshPolyhedraVertexAttributeStyle } from "./vertex";
import { useMeshPolyhedraVisibilityStyle } from "./visibility";
import { whenDefined } from "@ogw_internal/stores/data_style/when_defined";

// Local constants

interface MeshPolyhedraActiveColoringDeps {
  readonly commonStyle: ReturnType<typeof useMeshPolyhedraCommonStyle>;
  readonly colorStyle: ReturnType<typeof useMeshPolyhedraColorStyle>;
  readonly vertexAttributeStyle: ReturnType<typeof useMeshPolyhedraVertexAttributeStyle>;
  readonly polyhedronAttributeStyle: ReturnType<typeof useMeshPolyhedraPolyhedronAttributeStyle>;
}

function handleMeshPolyhedraVertexColoring(
  meshId: DataId,
  vertexAttributeStyle: ReturnType<typeof useMeshPolyhedraVertexAttributeStyle>,
): Promise<unknown> | undefined {
  const name = vertexAttributeStyle.meshPolyhedraVertexAttributeName(meshId);
  const item = vertexAttributeStyle.meshPolyhedraVertexAttributeItem(meshId);
  const [minimum, maximum] = vertexAttributeStyle.meshPolyhedraVertexAttributeRange(meshId);
  const colorMap = vertexAttributeStyle.meshPolyhedraVertexAttributeColorMap(meshId);
  const no_data_color = vertexAttributeStyle.meshPolyhedraVertexAttributeNoDataColor(meshId);
  const vertex_attribute = { name, item, minimum, maximum, colorMap, no_data_color };
  if (!isAttributeValid(vertex_attribute)) {
    return undefined;
  }
  return vertexAttributeStyle.setMeshPolyhedraVertexAttribute(meshId, vertex_attribute);
}

function handleMeshPolyhedraPolyhedronColoring(
  meshId: DataId,
  polyhedronAttributeStyle: ReturnType<typeof useMeshPolyhedraPolyhedronAttributeStyle>,
): Promise<unknown> | undefined {
  const name = polyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeName(meshId);
  const item = polyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeItem(meshId);
  const [minimum, maximum] = polyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeRange(meshId);
  const colorMap = polyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeColorMap(meshId);
  const no_data_color =
    polyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeNoDataColor(meshId);
  const polyhedron_attribute = {
    name,
    item,
    minimum,
    maximum,
    colorMap,
    no_data_color,
  };
  if (!isAttributeValid(polyhedron_attribute)) {
    return undefined;
  }
  return polyhedronAttributeStyle.setMeshPolyhedraPolyhedronAttribute(meshId, polyhedron_attribute);
}

async function applyMeshPolyhedraActiveColoring(
  meshId: DataId,
  type: string | undefined,
  deps: MeshPolyhedraActiveColoringDeps,
): Promise<unknown> {
  await deps.commonStyle.mutateMeshPolyhedraStyle(meshId, {
    coloring: { active: type },
  });
  if (type === "constant") {
    const result = await whenDefined(deps.colorStyle.meshPolyhedraColor(meshId), async (value) => {
      const applied = await deps.colorStyle.setMeshPolyhedraColor(meshId, value);
      return applied;
    });
    return result;
  }
  if (type === "vertex") {
    const result = await handleMeshPolyhedraVertexColoring(meshId, deps.vertexAttributeStyle);
    return result;
  }
  if (type === "polyhedron") {
    const result = await handleMeshPolyhedraPolyhedronColoring(
      meshId,
      deps.polyhedronAttributeStyle,
    );
    return result;
  }
  throw new Error(`Unknown mesh polyhedra coloring type: ${type}`);
}

async function setMeshPolyhedraActiveColoring(
  meshId: DataId,
  type: string | undefined,
  deps: MeshPolyhedraActiveColoringDeps,
): Promise<unknown> {
  const result = await applyMeshPolyhedraActiveColoring(meshId, type, deps);
  if (type !== "constant") {
    // Attribute and textures colorings keep the actor opacity: restore the stored one
    await whenDefined(deps.colorStyle.meshPolyhedraOpacity(meshId), async (value) => {
      const applied = await deps.colorStyle.setMeshPolyhedraOpacity(meshId, value);
      return applied;
    });
  }
  return result;
}

async function applyMeshPolyhedraStyle(
  meshId: DataId,
  visibilityStyle: ReturnType<typeof useMeshPolyhedraVisibilityStyle>,
  activeColoringType: string | undefined,
  deps: MeshPolyhedraActiveColoringDeps,
): Promise<unknown[]> {
  const result = await Promise.all([
    whenDefined(visibilityStyle.meshPolyhedraVisibility(meshId), async (value) => {
      const applied = await visibilityStyle.setMeshPolyhedraVisibility(meshId, value);
      return applied;
    }),
    setMeshPolyhedraActiveColoring(meshId, activeColoringType, deps),
  ]);
  return result;
}

type UseMeshPolyhedraStyleReturn = ReturnType<typeof useMeshPolyhedraCommonStyle> & {
  meshPolyhedraColoring: (meshId: DataId) => StyleValues;
  meshPolyhedraActiveColoring: (meshId: DataId) => string | undefined;
  setMeshPolyhedraActiveColoring: (meshId: DataId, type: string | undefined) => Promise<unknown>;
  applyMeshPolyhedraStyle: (meshId: DataId) => Promise<unknown[]>;
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

  function meshPolyhedraColoring(meshId: DataId): StyleValues {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(meshId);
  }

  function meshPolyhedraActiveColoring(meshId: DataId): string | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.active is defined as string in the data style schema.
    return meshPolyhedraColoring(meshId).active as string | undefined;
  }

  async function boundSetMeshPolyhedraActiveColoring(
    meshId: DataId,
    type: string | undefined,
  ): Promise<unknown> {
    const result = await setMeshPolyhedraActiveColoring(meshId, type, activeColoringDeps);
    return result;
  }

  async function boundApplyMeshPolyhedraStyle(meshId: DataId): Promise<unknown[]> {
    const result = await applyMeshPolyhedraStyle(
      meshId,
      meshPolyhedraVisibility,
      meshPolyhedraActiveColoring(meshId),
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
