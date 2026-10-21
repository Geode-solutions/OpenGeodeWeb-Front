import {
  type AttributeColoring,
  type AttributeColoringStyle,
  attributeSchemas,
  attributeType,
  storeMethod,
  useAttributeColoringStyle,
} from "@ogw_front/composables/attribute_coloring_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";

interface MeshElement {
  // Element type of the store methods, e.g. "MeshPoints" for "setMeshPointsVertexAttributeRange"
  storeName: string;
  styleKey: "points" | "edges" | "polygons" | "cells" | "polyhedra";
}

const MESH_ELEMENTS: MeshElement[] = [
  { storeName: "MeshPoints", styleKey: "points" },
  { storeName: "MeshEdges", styleKey: "edges" },
  { storeName: "MeshPolygons", styleKey: "polygons" },
  { storeName: "MeshCells", styleKey: "cells" },
  { storeName: "MeshPolyhedra", styleKey: "polyhedra" },
];

const ATTRIBUTE_COLORINGS = new Set(["vertex", "edge", "polygon", "cell", "polyhedron"]);

function isColoring(value: unknown): value is { active?: string } {
  return typeof value === "object" && value !== null;
}

// Styles the mesh elements colored by an attribute
export function useGlobalAttributeStyle(
  dataIdRef: Ref<string | undefined>,
): AttributeColoringStyle {
  const dataStyleStore = useDataStyleStore();

  function meshColoring(
    dataId: string,
    { storeName }: MeshElement,
    activeColoring: string,
  ): AttributeColoring {
    const methodName = `${storeName}${attributeType(activeColoring)}`;
    const getterName = `${methodName.charAt(0).toLowerCase()}${methodName.slice(1)}`;
    return {
      read: (property): unknown => storeMethod(dataStyleStore, `${getterName}${property}`)(dataId),
      write: async (property, ...values): Promise<void> => {
        await storeMethod(dataStyleStore, `set${methodName}${property}`)(dataId, ...values);
      },
      schemas: attributeSchemas("", activeColoring),
      params: { id: dataId },
    };
  }

  const colorings = computed<AttributeColoring[]>(() => {
    const dataId = dataIdRef.value;
    // The picker exists before any scalar bar is picked
    if (dataId === undefined) {
      return [];
    }
    const style = dataStyleStore.getStyle(dataId);
    return MESH_ELEMENTS.flatMap((element) => {
      const coloring: unknown = style[element.styleKey]?.coloring;
      const activeColoring = isColoring(coloring) ? coloring.active : undefined;
      return activeColoring !== undefined && ATTRIBUTE_COLORINGS.has(activeColoring)
        ? [meshColoring(dataId, element, activeColoring)]
        : [];
    });
  });

  const style = useAttributeColoringStyle(colorings);
  watch(dataIdRef, style.loadTimeSteps, { immediate: true });
  return style;
}
