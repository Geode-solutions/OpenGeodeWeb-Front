// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { type Mock, describe, expect, test, vi } from "vitest";

// Local imports
import {
  applyTimeSeriesWorkflow,
  importWorkflow,
  reloadObject,
} from "@ogw_front/utils/import_workflow";
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

vi.setConfig({ testTimeout: 10_000 });

function setup(): {
  calls: string[];
  request: Mock;
  applyDefaultStyle: Mock;
  addDataStyle: Mock;
  remoteRender: Mock;
  addHybridItem: Mock;
} {
  const calls: string[] = [];
  const backStore = useBackStore();
  const dataStore = useDataStore();
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();
  const request = vi.fn().mockResolvedValue({ id: "brep_id", viewer_type: "model" });
  const applyDefaultStyle = vi.fn().mockImplementation(() => {
    calls.push("style");
    return [];
  });
  const addDataStyle = vi.fn();
  const remoteRender = vi.fn();
  const addHybridItem = vi.fn().mockImplementation(() => {
    calls.push("hybrid");
  });
  backStore.request = mockAs<typeof backStore.request>(request);
  dataStore.item = mockAs<typeof dataStore.item>(
    vi.fn().mockResolvedValue({ id: "brep_id", name: "cube" }),
  );
  dataStore.deregisterObject = mockAs<typeof dataStore.deregisterObject>(
    vi.fn().mockImplementation(() => {
      calls.push("deregister");
    }),
  );
  dataStore.registerObject = mockAs<typeof dataStore.registerObject>(
    vi.fn().mockImplementation(() => {
      calls.push("register");
    }),
  );
  dataStyleStore.applyDefaultStyle =
    mockAs<typeof dataStyleStore.applyDefaultStyle>(applyDefaultStyle);
  dataStyleStore.addDataStyle = mockAs<typeof dataStyleStore.addDataStyle>(addDataStyle);
  hybridViewerStore.remoteRender = mockAs<typeof hybridViewerStore.remoteRender>(remoteRender);
  hybridViewerStore.addItem = mockAs<typeof hybridViewerStore.addItem>(addHybridItem);
  return { calls, request, applyDefaultStyle, addDataStyle, remoteRender, addHybridItem };
}

describe("apply time series workflow", () => {
  setupActivePinia();

  test("keeps the id and re-applies the stored style", async () => {
    const { calls, request, applyDefaultStyle, remoteRender } = setup();

    const id = await applyTimeSeriesWorkflow("time_series.pvd", "brep_id");

    expect(id).toBe("brep_id");
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "brep_id", filename: "time_series.pvd" } }),
    );
    expect(calls).toStrictEqual(["deregister", "register", "hybrid", "style"]);
    expect(applyDefaultStyle).toHaveBeenCalledWith("brep_id");
    expect(remoteRender).toHaveBeenCalledWith();
  });

  test("does not reset the style", async () => {
    const { addDataStyle } = setup();

    await applyTimeSeriesWorkflow("time_series.pvd", "brep_id");

    expect(addDataStyle).not.toHaveBeenCalled();
  });
});

describe("reload object", () => {
  setupActivePinia();

  test("re-registers the object with its stored style", async () => {
    const { calls, request, applyDefaultStyle, remoteRender } = setup();

    await reloadObject("brep_id");

    expect(request).not.toHaveBeenCalled();
    // The local actor is rebuilt too: the light viewable may have moved
    expect(calls).toStrictEqual(["deregister", "register", "hybrid", "style"]);
    expect(applyDefaultStyle).toHaveBeenCalledWith("brep_id");
    expect(remoteRender).toHaveBeenCalledWith();
  });
});

describe("import workflow", () => {
  setupActivePinia();

  test("a failing file does not prevent the others from being imported", async () => {
    const { request, remoteRender } = setup();
    request
      .mockRejectedValueOnce(new Error("cannot load"))
      .mockResolvedValueOnce({ id: "model.og_brep", name: "model", viewer_type: "mesh" });
    const dataStore = useDataStore();
    dataStore.addItem = mockAs<typeof dataStore.addItem>(vi.fn().mockResolvedValue(undefined));
    dataStore.isItemViewable = mockAs<typeof dataStore.isItemViewable>(
      vi.fn().mockResolvedValue(false),
    );

    await expect(
      importWorkflow([
        { filename: "broken.vtu", geode_object_type: "SolidMesh3D" },
        { filename: "model.og_brep", geode_object_type: "BRep" },
      ]),
    ).rejects.toThrow("1 file(s) could not be imported");
    expect(dataStore.addItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: "model.og_brep" }),
    );
    expect(remoteRender).toHaveBeenCalledWith();
  });
});
