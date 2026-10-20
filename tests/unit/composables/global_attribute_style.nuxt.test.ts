// Third party imports
import { describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

// Local imports
import { useGlobalAttributeStyle } from "@ogw_front/composables/global_attribute_style";

const MODEL_ID = "model";
const BLOCK_VIEWER_ID = 48;
const BLOCK_GEODE_ID = "block";

const setColorMap = vi.fn<(modelId: string, blockIds: string[], colorMap: string) => boolean>();
const remoteRender = vi.fn<() => undefined>();

vi.mock(import("@ogw_front/stores/data_style") as Promise<unknown>, () => ({
  useDataStyleStore: (): Record<string, unknown> => ({
    modelBlockActiveColoring: (): string => "polyhedron",
    modelBlocksPolyhedronAttributeColorMap: (): string => "batlow",
    setModelBlocksPolyhedronAttributeColorMap: setColorMap,
  }),
}));
vi.mock(import("@ogw_front/stores/data") as Promise<unknown>, () => ({
  useDataStore: (): Record<string, unknown> => ({
    getComponentByViewerId: (): { type: string; geode_id: string } => ({
      type: "Block",
      geode_id: BLOCK_GEODE_ID,
    }),
  }),
}));
vi.mock(import("@ogw_front/stores/hybrid_viewer") as Promise<unknown>, () => ({
  useHybridViewerStore: (): Record<string, unknown> => ({ remoteRender }),
}));
vi.mock(import("@ogw_front/stores/back") as Promise<unknown>, () => ({
  useBackStore: (): Record<string, unknown> => ({ request: vi.fn<() => undefined>() }),
}));

describe("global attribute style", () => {
  test("applies the colormap to the model blocks of the picked scalar bar", async () => {
    const { currentColormap, applyGlobalColormap } = useGlobalAttributeStyle(
      ref(MODEL_ID),
      ref([BLOCK_VIEWER_ID]),
    );
    await flushPromises();

    expect(currentColormap.value).toBe("batlow");
    await applyGlobalColormap("viridis");

    expect(setColorMap).toHaveBeenCalledWith(MODEL_ID, [BLOCK_GEODE_ID], "viridis");
    expect(remoteRender).toHaveBeenCalledWith();
  });
});
