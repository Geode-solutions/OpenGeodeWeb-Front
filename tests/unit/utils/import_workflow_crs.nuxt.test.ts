// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { type Mock, beforeEach, describe, expect, test, vi } from "vitest";

// Local imports
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import { importWorkflow } from "@ogw_front/utils/import_workflow";
import { useBackStore } from "@ogw_front/stores/back";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import type { useProjectCrs } from "@ogw_front/composables/project_crs";

interface ProjectCrsModule {
  useProjectCrs: typeof useProjectCrs;
}

vi.setConfig({ testTimeout: 10_000 });

const harmonizeImportedCrs = vi.hoisted(() => vi.fn());
vi.mock(import("@ogw_front/composables/project_crs"), () => ({
  useProjectCrs: vi.fn().mockReturnValue({ harmonizeImportedCrs, adoptProjectCrs: vi.fn() }),
}));

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
  const request = vi.fn().mockResolvedValue({ id: "brep_id", viewer_object_type: "model" });
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

function stubData(existing: string[], all: string[]): void {
  const dataStore = useDataStore();
  dataStore.addItem = mockAs<typeof dataStore.addItem>(vi.fn().mockResolvedValue(undefined));
  dataStore.fetchIsViewable = mockAs<typeof dataStore.fetchIsViewable>(
    vi.fn().mockResolvedValue(false),
  );
  dataStore.allItems = mockAs<typeof dataStore.allItems>(
    vi
      .fn()
      .mockResolvedValueOnce(existing.map((data_id) => ({ data_id })))
      .mockResolvedValue(all.map((data_id) => ({ data_id }))),
  );
}

describe("import workflow crs harmonization", () => {
  setupActivePinia();

  beforeEach(() => {
    harmonizeImportedCrs.mockReset().mockResolvedValue(undefined);
    useCrsStore().projectCrs = undefined;
  });

  test("harmonizes the imported data with the project crs read before the import", async () => {
    const { request } = setup();
    request.mockResolvedValueOnce({
      data: [{ id: "new", name: "new", viewer_object_type: "mesh" }],
    });
    stubData(["old"], ["old", "new"]);
    const crs = { authority: "EPSG", code: "2193", name: "NZGD2000" };
    useCrsStore().projectCrs = crs;

    await importWorkflow([{ filename: "new.vtu", geode_object_type: "TetrahedralSolid3D" }]);

    expect(harmonizeImportedCrs).toHaveBeenCalledExactlyOnceWith(["new"], crs);
  });

  test("harmonizes what was imported when a file fails", async () => {
    const { request } = setup();
    request
      .mockResolvedValueOnce({ data: [{ id: "ok", name: "ok", viewer_object_type: "mesh" }] })
      .mockRejectedValueOnce(new Error("cannot load"));
    stubData([], ["ok"]);

    await expect(
      importWorkflow([
        { filename: "ok.vtu", geode_object_type: "TetrahedralSolid3D" },
        { filename: "broken.vtu", geode_object_type: "TetrahedralSolid3D" },
      ]),
    ).rejects.toThrow("1 file(s) could not be imported");

    expect(harmonizeImportedCrs).toHaveBeenCalledWith(["ok"], undefined);
  });

  test("does nothing without a project crs", async () => {
    const { request } = setup();
    request.mockResolvedValueOnce({
      data: [{ id: "new", name: "new", viewer_object_type: "mesh" }],
    });
    stubData([], ["new"]);
    const actual = await vi.importActual<ProjectCrsModule>("@ogw_front/composables/project_crs");
    harmonizeImportedCrs.mockImplementation(actual.useProjectCrs().harmonizeImportedCrs);
    const addSnackbar = vi.spyOn(useFeedbackStore(), "add_warning");

    await importWorkflow([{ filename: "new.vtu", geode_object_type: "TetrahedralSolid3D" }]);
    await vi.waitFor(() => {
      expect(harmonizeImportedCrs).toHaveBeenCalledExactlyOnceWith(["new"], undefined);
    });

    expect(request).toHaveBeenCalledExactlyOnceWith(expect.anything());
    expect(addSnackbar).not.toHaveBeenCalled();
  });
});
