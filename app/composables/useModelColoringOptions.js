import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

/**
 * Factorizes all coloring computeds for one context level:
 *   - global  : componentId = null, componentType = null, selection provided
 *   - type    : componentId = null, componentType = ref("Surface"|…)
 *   - component: componentId = ref("…"), componentType = null
 *
 * @param {object} params
 * @param {Ref<string>}   params.modelId
 * @param {Ref<string>}  [params.componentId]  - reactive ref, may be null/undefined
 * @param {Ref<string>}  [params.componentType] - reactive ref, may be null/undefined
 * @param {Ref<string[]>}[params.selection]    - visible mesh components (global only)
 */
export function useModelColoringOptions({ modelId, componentId, componentType, selection }) {
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();

  /** Helpers that always return the current reactive value or undefined */
  const cId = () => componentId?.value ?? undefined;
  const cType = () => componentType?.value ?? undefined;
  const remoteRender = () => hybridViewerStore.remoteRender();

  // ─── Coloring style key ───────────────────────────────────────────────────
  const coloringStyleKey = computed({
    get: () => dataStyleStore.modelComponentColoringStyleKey(modelId.value, cId(), cType()),
    set: async (v) => {
      await dataStyleStore.setModelComponentColoringStyleKey(modelId.value, cId(), cType(), v);
      remoteRender();
    },
  });

  // ─── Constant color ───────────────────────────────────────────────────────
  const color = computed({
    get: () => dataStyleStore.modelComponentColor(modelId.value, cId(), cType()),
    set: async (v) => {
      await dataStyleStore.setModelComponentColor(modelId.value, cId(), cType(), v);
      remoteRender();
    },
  });

  // ─── Color mode (constant / random) ──────────────────────────────────────
  const colorMode = computed({
    get: () => {
      if (cType()) return dataStyleStore.getModelComponentTypeColorMode(modelId.value, cType());
      if (cId()) return dataStyleStore.getModelComponentColorMode(modelId.value, cId());
      // Global fallback: read from first visible component
      if (selection?.value?.length > 0) {
        return dataStyleStore.getModelComponentColorMode(modelId.value, selection.value[0]);
      }
      return "constant";
    },
    set: async (newValue) => {
      if (cType()) {
        await dataStyleStore.setModelComponentTypeColorMode(modelId.value, cType(), newValue);
      } else if (cId()) {
        await dataStyleStore.setModelComponentColorMode(modelId.value, cId(), newValue);
      } else if (selection?.value?.length > 0) {
        // Global: dispatch to each component type separately
        const currentColor = newValue === "random" ? undefined : color.value;
        await dataStyleStore.setModelComponentsColor(
          modelId.value,
          selection.value,
          currentColor,
          newValue,
        );
      }
      remoteRender();
    },
  });

  // ─── Attribute computeds factory ──────────────────────────────────────────
  function makeAttrComputeds(fieldType) {
    return {
      name: computed({
        get: () => dataStyleStore.modelComponentAttributeName(modelId.value, cId(), cType()),
        set: async (v) => {
          await dataStyleStore.setModelComponentAttributeName(
            modelId.value,
            cId(),
            cType(),
            v,
            fieldType,
          );
          remoteRender();
        },
      }),
      range: computed({
        get: () => dataStyleStore.modelComponentAttributeRange(modelId.value, cId(), cType()),
        set: async (v) => {
          await dataStyleStore.setModelComponentAttributeRange(
            modelId.value,
            cId(),
            cType(),
            v[0],
            v[1],
          );
          remoteRender();
        },
      }),
      colorMap: computed({
        get: () => dataStyleStore.modelComponentAttributeColorMap(modelId.value, cId(), cType()),
        set: async (v) => {
          await dataStyleStore.setModelComponentAttributeColorMap(
            modelId.value,
            cId(),
            cType(),
            v,
          );
          remoteRender();
        },
      }),
    };
  }

  return {
    coloringStyleKey,
    color,
    colorMode,
    vertex: makeAttrComputeds("vertex"),
    cell: makeAttrComputeds("cells"),
    edge: makeAttrComputeds("edges"),
    polygon: makeAttrComputeds("polygons"),
    polyhedron: makeAttrComputeds("polyhedra"),
  };
}
