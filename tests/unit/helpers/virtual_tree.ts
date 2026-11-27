import { type EmitFn, useVirtualTree } from "@ogw_front/composables/virtual_tree";
import { type Mock, vi } from "vitest";
import { ref } from "vue";

// Surface S has its boundaries as details: Surfaces > S > Boundaries > line1, line2
const line1 = { id: "line1", title: "Line 1" };
const line2 = { id: "line2", title: "Line 2" };
const boundaries = { id: "S:boundaries", title: "Boundaries (2)", children: [line1, line2] };
const surface = { id: "S", title: "Surface S", details: [boundaries] };
const otherSurface = { id: "T", title: "Surface T" };
const surfaces = { id: "Surface", title: "Surfaces", children: [surface, otherSurface] };

// Each displayed row as [id, depth, isLeaf, isExpandable]
function rows(tree: ReturnType<typeof useVirtualTree>): unknown[] {
  return tree.displayItems.value.map((row) => [row.id, row.depth, row.isLeaf, row.isExpandable]);
}

function setupDetailsTree(overrides: Record<string, unknown> = {}): {
  tree: ReturnType<typeof useVirtualTree>;
  emit: Mock<EmitFn>;
} {
  const props = ref({
    items: [surfaces],
    opened: ["Surface"],
    selected: [] as string[],
    selection: { selectable: true, strategy: "classic" },
    ...overrides,
  });
  const emit = vi.fn<EmitFn>();
  return { tree: useVirtualTree(props, emit), emit };
}

export { boundaries, rows, setupDetailsTree, surface, surfaces };
