import type {
  ComponentType,
  ElementType,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { ModelId } from "@ogw_front/types/identifiers";
import type { PhysicalPropertyNode } from "@ogw_front/utils/physical_properties_tree";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// The colormap the attribute selector starts with
const DEFAULT_COLOR_MAP = "batlow";
// The coloring a component goes back to when the property coloring is removed
const CONSTANT_COLORING = "constant";

type DataStyleStore = ReturnType<typeof useDataStyleStore>;

// The style store methods coloring the components of one type by an attribute of one element
interface ColoringMethods {
  setAttribute: (modelId: ModelId, ids: string[], input: ValidAttributeInput) => Promise<unknown>;
  setActiveColoring: (modelId: ModelId, ids: string[], activeColoring: string) => Promise<unknown>;
  activeColoring: (modelId: ModelId, id: string) => unknown;
  attributeName: (modelId: ModelId, id: string) => string | undefined;
}

// The same methods as the coloring options, for each element a component type has: a pair the
// Back schema allows but no component has (e.g. a Corner polygon) has none
function coloringMethods(
  store: DataStyleStore,
  componentType: ComponentType,
  elementType: ElementType,
): ColoringMethods | undefined {
  const methods: Record<ComponentType, Partial<Record<ElementType, ColoringMethods>>> = {
    Block: {
      polyhedron: {
        setAttribute: store.setModelBlocksPolyhedronAttribute,
        setActiveColoring: store.setModelBlocksActiveColoring,
        activeColoring: store.modelBlockActiveColoring,
        attributeName: store.modelBlocksPolyhedronAttributeName,
      },
      vertex: {
        setAttribute: store.setModelBlocksVertexAttribute,
        setActiveColoring: store.setModelBlocksActiveColoring,
        activeColoring: store.modelBlockActiveColoring,
        attributeName: store.modelBlocksVertexAttributeName,
      },
    },
    Surface: {
      polygon: {
        setAttribute: store.setModelSurfacesPolygonAttribute,
        setActiveColoring: store.setModelSurfacesActiveColoring,
        activeColoring: store.modelSurfaceActiveColoring,
        attributeName: store.modelSurfacesPolygonAttributeName,
      },
      vertex: {
        setAttribute: store.setModelSurfacesVertexAttribute,
        setActiveColoring: store.setModelSurfacesActiveColoring,
        activeColoring: store.modelSurfaceActiveColoring,
        attributeName: store.modelSurfacesVertexAttributeName,
      },
    },
    Line: {
      edge: {
        setAttribute: store.setModelLinesEdgeAttribute,
        setActiveColoring: store.setModelLinesActiveColoring,
        activeColoring: store.modelLineActiveColoring,
        attributeName: store.modelLinesEdgeAttributeName,
      },
      vertex: {
        setAttribute: store.setModelLinesVertexAttribute,
        setActiveColoring: store.setModelLinesActiveColoring,
        activeColoring: store.modelLineActiveColoring,
        attributeName: store.modelLinesVertexAttributeName,
      },
    },
    Corner: {
      vertex: {
        setAttribute: store.setModelCornersVertexAttribute,
        setActiveColoring: store.setModelCornersActiveColoring,
        activeColoring: store.modelCornerActiveColoring,
        attributeName: store.modelCornersVertexAttributeName,
      },
    },
  };
  return methods[componentType][elementType];
}

// Colors the components carrying a physical property by its attribute, through the same style
// Store methods as the coloring options, e.g. "setModelBlocksPolyhedronAttribute"
export function usePhysicalPropertyColoring(modelId: ModelId): {
  isColoredBy: (node: PhysicalPropertyNode) => boolean;
  toggleColoring: (node: PhysicalPropertyNode) => Promise<void>;
} {
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();

  function nodeMethods(node: PhysicalPropertyNode): ColoringMethods | undefined {
    return coloringMethods(dataStyleStore, node.component_type, node.element_type);
  }

  // The components of a property share its coloring: reading the first one is enough
  function isColoredBy(node: PhysicalPropertyNode): boolean {
    const [component] = node.children;
    const methods = nodeMethods(node);
    if (component === undefined || methods === undefined) {
      return false;
    }
    return (
      methods.activeColoring(modelId, component.id) === node.element_type &&
      methods.attributeName(modelId, component.id) === node.attribute_name
    );
  }

  async function toggleColoring(node: PhysicalPropertyNode): Promise<void> {
    const methods = nodeMethods(node);
    if (methods === undefined) {
      return;
    }
    const componentIds = node.children.map((component) => component.id);
    if (isColoredBy(node)) {
      await methods.setActiveColoring(modelId, componentIds, CONSTANT_COLORING);
    } else if (node.coloring !== undefined) {
      const { item, minimum, maximum } = node.coloring;
      await methods.setAttribute(modelId, componentIds, {
        name: node.attribute_name,
        item,
        minimum,
        maximum,
        colorMap: DEFAULT_COLOR_MAP,
      });
      await methods.setActiveColoring(modelId, componentIds, node.element_type);
    }
    await hybridViewerStore.remoteRender();
  }

  return { isColoredBy, toggleColoring };
}
