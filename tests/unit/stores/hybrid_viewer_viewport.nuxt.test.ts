// Third party imports
import { describe, expect, test, vi } from "vitest";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { useHybridViewerCore } from "@ogw_internal/stores/hybrid_viewer/core";
import { useHybridViewerViewport } from "@ogw_internal/stores/hybrid_viewer/viewport";
import { useViewerStore } from "@ogw_front/stores/viewer";

const WIDTH = 800.4;
const HEIGHT = 600.6;
const ROUNDED_WIDTH = 800;
const ROUNDED_HEIGHT = 601;

describe("hybrid viewer resize", () => {
  test("stores the rounded view size used as the default screenshot size", async () => {
    const viewerStore = useViewerStore();
    viewerStore.status = Status.CONNECTED;
    const core = useHybridViewerCore();
    core.status.value = Status.CREATED;
    const renderWindow = {
      getApiSpecificRenderWindow: (): unknown => ({
        getCanvas: (): HTMLCanvasElement => document.createElement("canvas"),
        setSize: vi.fn<(width: number, height: number) => void>(),
      }),
      getRenderWindow: (): { render: () => void } => ({ render: vi.fn<() => void>() }),
    };
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    core.genericRenderWindow.value = renderWindow as never;
    vi.spyOn(core, "remoteRender").mockResolvedValue();

    await useHybridViewerViewport().resize(WIDTH, HEIGHT);

    expect(viewerStore.view_size).toStrictEqual({ width: ROUNDED_WIDTH, height: ROUNDED_HEIGHT });
  });
});
