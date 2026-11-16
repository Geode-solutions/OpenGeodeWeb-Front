// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { effectScope } from "vue";
import { flushPromises } from "@vue/test-utils";

// Local imports
import { useHoverhighlight } from "@ogw_front/composables/hover_highlight";
import { useModelHeaderHover } from "@ogw_front/composables/model_header_hover";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const HOVER_DELAY = 200;

const request = vi.fn<(request: { params: Record<string, unknown> }) => Promise<void>>();

vi.mock(import("@ogw_front/stores/viewer") as Promise<unknown>, () => ({
  useViewerStore: (): { request: typeof request } => ({ request }),
}));
vi.mock(import("@ogw_front/stores/data") as Promise<unknown>, () => ({
  useDataStore: (): Record<string, unknown> => ({
    isItemViewable: vi.fn<() => Promise<boolean>>().mockResolvedValue(true),
    getAllModelComponentsViewerIds: vi.fn<() => Promise<number[]>>().mockResolvedValue([2, 3]),
  }),
}));

// Runs a composable in its own scope, as a component would: stop() unmounts it
function mount<Result>(setup: () => Result): { result: Result; stop: () => void } {
  const scope = effectScope();
  const result = scope.run(setup);
  if (result === undefined) {
    throw new Error("setup returned nothing");
  }
  return { result, stop: () =>{  scope.stop(); } };
}

function lastVisibility(): unknown {
  return request.mock.calls.at(-1)?.[0].params.visibility;
}

describe("model header hover", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
    request.mockReset().mockResolvedValue();
  });

  test("a view closed while its header is hovered is released", async () => {
    const treeviewStore = useTreeviewStore();
    const scope = mount(() => useModelHeaderHover());
    const { onModelHeaderEnter } = scope.result;
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    onModelHeaderEnter("a");
    await vi.advanceTimersByTimeAsync(HOVER_DELAY);
    await flushPromises();
    expect(lastVisibility()).toBe(true);

    treeviewStore.closeView("a");
    await flushPromises();

    expect(treeviewStore.hoveredModelId).toBeUndefined();
    expect(lastVisibility()).toBe(false);
    scope.stop();
  });

  test("a view closed before the highlight delay never highlights", async () => {
    const treeviewStore = useTreeviewStore();
    const scope = mount(() => useModelHeaderHover());
    const { onModelHeaderEnter } = scope.result;
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    await flushPromises();
    onModelHeaderEnter("a");
    treeviewStore.closeView("a");
    await flushPromises();
    await vi.advanceTimersByTimeAsync(HOVER_DELAY);
    await flushPromises();

    expect(request).not.toHaveBeenCalled();
    scope.stop();
  });

  test("a highlight started from the rows of a closed view is released", async () => {
    const treeviewStore = useTreeviewStore();
    const scope = mount(() => useModelHeaderHover());
    const rowsTree = mount(() => useHoverhighlight());
    const { onHoverEnter } = rowsTree.result;
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    onHoverEnter("a", [2], "model", true);
    await flushPromises();
    expect(lastVisibility()).toBe(true);

    treeviewStore.closeView("a");
    await flushPromises();

    expect(lastVisibility()).toBe(false);
    rowsTree.stop();
    scope.stop();
  });

  test("closing another view leaves a hovered one highlighted", async () => {
    const treeviewStore = useTreeviewStore();
    const scope = mount(() => useModelHeaderHover());
    const { onModelHeaderEnter } = scope.result;
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    treeviewStore.displayAdditionalTree("b", "other", "BRep");
    onModelHeaderEnter("a");
    await vi.advanceTimersByTimeAsync(HOVER_DELAY);
    await flushPromises();

    treeviewStore.closeView("b");
    await flushPromises();

    expect(lastVisibility()).toBe(true);
    expect(treeviewStore.hoveredModelId).toBe("a");
    scope.stop();
  });

  test("unmounting a hovered component unhighlights", async () => {
    const scope = mount(() => useHoverhighlight());
    const { onHoverEnter } = scope.result;
    onHoverEnter("a", [2], "model", true);
    await flushPromises();
    expect(lastVisibility()).toBe(true);

    scope.stop();
    await flushPromises();

    expect(lastVisibility()).toBe(false);
  });
});
