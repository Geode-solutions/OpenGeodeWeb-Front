import type { ModelId } from "@ogw_front/types/identifiers";
import type { PhysicalPropertyNode } from "@ogw_front/utils/physical_properties_tree";
import { storeMethod } from "@ogw_front/composables/attribute_coloring_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// The colormap the attribute selector starts with
const DEFAULT_COLOR_MAP = "batlow";
// The coloring a component goes back to when the property coloring is removed
const CONSTANT_COLORING = "constant";

// "polyhedron" -> "Polyhedron", as in the style store method names
function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

// Colors the components carrying a physical property by its attribute, through the same style
// Store methods as the coloring options, e.g. "setModelBlocksPolyhedronAttribute"
export function usePhysicalPropertyColoring(modelId: ModelId): {
  isColoredBy: (node: PhysicalPropertyNode) => boolean;
  toggleColoring: (node: PhysicalPropertyNode) => Promise<void>;
} {
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();

  // The components of a property share its coloring: reading the first one is enough
  function isColoredBy(node: PhysicalPropertyNode): boolean {
    const [component] = node.children;
    if (component === undefined) {
      return false;
    }
    const type = node.component_type;
    const element = capitalize(node.element_type);
    const activeColoring = storeMethod(dataStyleStore, `model${type}ActiveColoring`)(
      modelId,
      component.id,
    );
    const attributeName = storeMethod(dataStyleStore, `model${type}s${element}AttributeName`)(
      modelId,
      component.id,
    );
    return activeColoring === node.element_type && attributeName === node.attribute_name;
  }

  async function toggleColoring(node: PhysicalPropertyNode): Promise<void> {
    const type = node.component_type;
    const componentIds = node.children.map((component) => component.id);
    const setActiveColoring = storeMethod(dataStyleStore, `setModel${type}sActiveColoring`);
    if (isColoredBy(node)) {
      await setActiveColoring(modelId, componentIds, CONSTANT_COLORING);
    } else if (node.coloring !== undefined) {
      const { item, minimum, maximum } = node.coloring;
      await storeMethod(
        dataStyleStore,
        `setModel${type}s${capitalize(node.element_type)}Attribute`,
      )(modelId, componentIds, {
        name: node.attribute_name,
        item,
        minimum,
        maximum,
        colorMap: DEFAULT_COLOR_MAP,
      });
      await setActiveColoring(modelId, componentIds, node.element_type);
    }
    await hybridViewerStore.remoteRender();
  }

  return { isColoredBy, toggleColoring };
}
