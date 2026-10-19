// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { type Mock, describe, expect, test, vi } from "vitest";

// Local imports
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import { applyTimeSeriesWorkflow } from "@ogw_front/utils/import_workflow";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

function setup(): {
  calls: string[];
  request: Mock;
  applyDefaultStyle: Mock;
  addDataStyle: Mock;
  remoteRender: Mock;
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
  return { calls, request, applyDefaultStyle, addDataStyle, remoteRender };
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
    expect(calls).toStrictEqual(["deregister", "register", "style"]);
    expect(applyDefaultStyle).toHaveBeenCalledWith("brep_id");
    expect(remoteRender).toHaveBeenCalledWith();
  });

  test("does not reset the style", async () => {
    const { addDataStyle } = setup();

    await applyTimeSeriesWorkflow("time_series.pvd", "brep_id");

    expect(addDataStyle).not.toHaveBeenCalled();
  });
});
