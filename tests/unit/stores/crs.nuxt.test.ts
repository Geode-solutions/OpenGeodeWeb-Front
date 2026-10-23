// oxlint-disable vitest/require-mock-type-parameters
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useCrsStore } from "@ogw_front/stores/crs";

vi.setConfig({ testTimeout: 10_000 });

const EXPECTED_REQUESTS = 1;
const CRS_LIST = [{ authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" }];

describe("crs store", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("loads the geographic list once per object type", async () => {
    const request = vi.fn().mockResolvedValue({ crs_list: CRS_LIST });
    const backStore = useBackStore();
    backStore.request = mockAs<typeof backStore.request>(request);
    const crsStore = useCrsStore();

    const [first, second] = await Promise.all([
      crsStore.geographicList("PointSet3D"),
      crsStore.geographicList("PointSet3D"),
    ]);
    await crsStore.geographicList("PointSet3D");

    expect(first).toStrictEqual(CRS_LIST);
    expect(second).toStrictEqual(CRS_LIST);
    expect(request).toHaveBeenCalledTimes(EXPECTED_REQUESTS);
  });

  test("does not cache a failed request", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ crs_list: CRS_LIST });
    const backStore = useBackStore();
    backStore.request = mockAs<typeof backStore.request>(request);
    const crsStore = useCrsStore();

    await expect(crsStore.geographicList("BRep")).resolves.toStrictEqual([]);
    await expect(crsStore.geographicList("BRep")).resolves.toStrictEqual(CRS_LIST);
  });

  test("does not cache a rejected request", async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error("back disconnected"))
      .mockResolvedValueOnce({ crs_list: CRS_LIST });
    const backStore = useBackStore();
    backStore.request = mockAs<typeof backStore.request>(request);
    const crsStore = useCrsStore();

    await expect(crsStore.geographicList("Section")).resolves.toStrictEqual([]);
    await expect(crsStore.geographicList("Section")).resolves.toStrictEqual(CRS_LIST);
  });

  test("forwards an edit request until it is cleared", () => {
    const crsStore = useCrsStore();
    expect(crsStore.crsEditEnabled).toBe(false);
    crsStore.enableCrsEdit();
    crsStore.requestCrsEdit("data-1");
    expect(crsStore.crsEditEnabled).toBe(true);
    expect(crsStore.crsEditRequest).toBe("data-1");
    crsStore.clearCrsEditRequest();
    expect(crsStore.crsEditRequest).toBeUndefined();
  });
});
