// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

// Local imports
import { useHoverhighlight } from "@ogw_front/composables/hover_highlight";

const VIEWABLE_ID = "viewable";
const NON_VIEWABLE_ID = "non_viewable";

const request = vi.fn<(request: { params: Record<string, unknown> }) => Promise<void>>();
const isViewable = vi.fn<(id: string) => boolean>();

vi.mock(import("@ogw_front/stores/viewer") as Promise<unknown>, () => ({
  useViewerStore: (): { request: typeof request } => ({ request }),
}));
vi.mock(import("@ogw_front/stores/data") as Promise<unknown>, () => ({
  useDataStore: (): { isViewable: typeof isViewable } => ({ isViewable }),
}));

describe("hover highlight", () => {
  beforeEach(() => {
    request.mockReset().mockResolvedValue();
    isViewable.mockReset();
  });

  test("highlights then unhighlights a viewable item", async () => {
    isViewable.mockReturnValue(true);
    const { onHoverEnter, onHoverLeave } = useHoverhighlight();
    onHoverEnter(VIEWABLE_ID, [], "model", true);
    await flushPromises();
    onHoverLeave(VIEWABLE_ID);
    await flushPromises();

    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[0]?.[0].params).toMatchObject({ id: VIEWABLE_ID, visibility: true });
    expect(request.mock.calls[1]?.[0].params).toMatchObject({ id: VIEWABLE_ID, visibility: false });
  });

  test("sends nothing to the viewer for a non viewable item", async () => {
    isViewable.mockReturnValue(false);
    const { onHoverEnter, onHoverLeave } = useHoverhighlight();
    onHoverEnter(NON_VIEWABLE_ID, [], "model", true);
    await flushPromises();
    onHoverLeave(NON_VIEWABLE_ID);
    await flushPromises();

    expect(request).not.toHaveBeenCalled();
  });

  test("sends nothing when left before the block ids resolve", async () => {
    const { promise, resolve } = Promise.withResolvers<readonly number[]>();
    isViewable.mockReturnValue(true);
    const { onHoverEnter, onHoverLeave } = useHoverhighlight();
    onHoverEnter(
      VIEWABLE_ID,
      async () => {
        const block_ids = await promise;
        return block_ids;
      },
      "model",
      true,
    );
    onHoverLeave(VIEWABLE_ID);
    resolve([]);
    await flushPromises();

    expect(request).not.toHaveBeenCalled();
  });
});
