// Third party imports
import { describe, expect, test, vi } from "vitest";
import { ref } from "vue";

// Local imports
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useOverlappingPicker } from "@ogw_front/composables/use_overlapping_picker";
import { useViewerStore } from "@ogw_front/stores/viewer";

vi.setConfig({ testTimeout: 10_000 });

const PICK = {
  x: 1,
  y: 2,
  containerWidth: 100,
  containerHeight: 100,
  containerRect: { left: 0, top: 0 },
};

describe("overlapping picker", () => {
  setupActivePinia();

  test("never asks the viewer to pick images", async () => {
    const meshId = crypto.randomUUID();
    const modelId = crypto.randomUUID();
    const image2dId = crypto.randomUUID();
    const image3dId = crypto.randomUUID();
    const dataStore = useDataStore();
    dataStore.refAllItems = mockAs<typeof dataStore.refAllItems>(() =>
      ref([
        { data_id: meshId, viewer_object_type: "mesh", geode_object_type: "PointSet3D" },
        { data_id: image2dId, viewer_object_type: "image", geode_object_type: "RasterImage2D" },
        { data_id: modelId, viewer_object_type: "model", geode_object_type: "BRep" },
        { data_id: image3dId, viewer_object_type: "image", geode_object_type: "RasterImage3D" },
      ]),
    );
    dataStore.isItemViewable = mockAs<typeof dataStore.isItemViewable>(
      vi.fn<() => Promise<boolean>>().mockResolvedValue(true),
    );
    const dataStyleState = useDataStyleState();
    await Promise.all(
      [meshId, modelId, image2dId, image3dId].map(async (id) => {
        await dataStyleState.mutateStyle(id, { visibility: true });
      }),
    );
    const viewerStore = useViewerStore();
    const request = vi
      .fn<(request: { params: { ids: string[] } }) => Promise<unknown>>()
      .mockResolvedValue({ array_ids: [], viewer_id: 0 });
    viewerStore.request = mockAs<typeof viewerStore.request>(request);

    const result = await useOverlappingPicker().get_viewer_id(PICK);

    expect(result).toStrictEqual({ id: undefined, viewer_id: undefined });
    const ids = request.mock.calls.flatMap(([sent]) => sent.params.ids);
    expect(ids.toSorted()).toStrictEqual([meshId, modelId].toSorted());
  });
});
