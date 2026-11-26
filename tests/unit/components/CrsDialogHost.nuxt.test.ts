// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import type CrsDialog from "@ogw_front/components/CrsDialog.vue";
import CrsDialogHost from "@ogw_front/components/CrsDialogHost.vue";
import type ProjectCrsDialog from "@ogw_front/components/ProjectCrsDialog.vue";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";

vi.setConfig({ testTimeout: 10_000 });

// Hoisted with vi.mock, so the stub exposes show and item to the test
const { CRS_DIALOG_STUB } = vi.hoisted(() => ({
  CRS_DIALOG_STUB: {
    name: "CrsDialog",
    props: ["show", "itemId"],
    emits: ["update:show", "assigned", "converted"],
    template:
      "<div data-testid='crsDialogStub' :data-show='show' :data-item='itemId'><button data-testid='closeStub' @click=\"$emit('update:show', false)\" /></div>",
  },
}));

// Hoisted with vi.mock, so the stub exposes show to the test
const { PROJECT_CRS_DIALOG_STUB } = vi.hoisted(() => ({
  PROJECT_CRS_DIALOG_STUB: {
    name: "ProjectCrsDialog",
    props: ["show"],
    emits: ["update:show", "changed"],
    template:
      "<div data-testid='projectCrsDialogStub' :data-show='show'><button data-testid='closeProjectStub' @click=\"$emit('update:show', false)\" /></div>",
  },
}));

vi.mock(import("@ogw_front/components/ProjectCrsDialog.vue"), () => ({
  // oxlint-disable-next-line no-unsafe-type-assertion -- stub only implements the subset of the component this suite touches
  default: PROJECT_CRS_DIALOG_STUB as unknown as typeof ProjectCrsDialog,
}));

vi.mock(import("@ogw_front/components/CrsDialog.vue"), () => ({
  // oxlint-disable-next-line no-unsafe-type-assertion -- stub only implements the subset of the component this suite touches
  default: CRS_DIALOG_STUB as unknown as typeof CrsDialog,
}));

describe("crs dialog host", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("opens the dialog on an edit request and clears it on close", async () => {
    vi.spyOn(useDataStore(), "item").mockResolvedValue({
      data_id: "item-1",
      geode_id: "00000000-0000-0000-0000-000000000001",
      name: "Points",
      viewer_object_type: "mesh",
      geode_object_type: "PointSet3D",
      visible: true,
      created_at: "",
    });
    const crsStore = useCrsStore();
    const wrapper = mount(CrsDialogHost, { global: { plugins: [vuetify] } });
    expect(crsStore.crsEditEnabled).toBe(true);

    crsStore.requestCrsEdit("item-1");
    await flushPromises();
    const dialog = wrapper.get('[data-testid="crsDialogStub"]');
    expect(dialog.attributes("data-show")).toBe("true");
    expect(dialog.attributes("data-item")).toBe("item-1");

    await wrapper.get('[data-testid="closeStub"]').trigger("click");
    expect(crsStore.crsEditRequest).toBeUndefined();

    crsStore.requestCrsEdit("item-1");
    await flushPromises();
    expect(wrapper.get('[data-testid="crsDialogStub"]').attributes("data-show")).toBe("true");
    wrapper.unmount();
  });

  test("opens the dialog for a request made before it mounted", async () => {
    vi.spyOn(useDataStore(), "item").mockResolvedValue({
      data_id: "item-1",
      geode_id: "00000000-0000-0000-0000-000000000001",
      name: "Points",
      viewer_object_type: "mesh",
      geode_object_type: "PointSet3D",
      visible: true,
      created_at: "",
    });
    // Requested on a page without a host, e.g. from a snackbar
    useCrsStore().requestCrsEdit("item-1");
    const wrapper = mount(CrsDialogHost, { global: { plugins: [vuetify] } });
    await flushPromises();

    const dialog = wrapper.get('[data-testid="crsDialogStub"]');
    expect(dialog.attributes("data-show")).toBe("true");
    expect(dialog.attributes("data-item")).toBe("item-1");
    wrapper.unmount();
  });

  test("an edit request for a deleted data does not open the dialog", async () => {
    vi.spyOn(useDataStore(), "item").mockRejectedValue(new Error("Item not found: item-1"));
    const crsStore = useCrsStore();
    const wrapper = mount(CrsDialogHost, { global: { plugins: [vuetify] } });

    crsStore.requestCrsEdit("item-1");
    await flushPromises();

    expect(wrapper.get('[data-testid="crsDialogStub"]').attributes("data-show")).toBe("false");
    // Cleared, so a later request for the same id is not ignored
    expect(crsStore.crsEditRequest).toBeUndefined();
    wrapper.unmount();
  });

  test("opens the project crs dialog on request and clears the request on close", async () => {
    const crsStore = useCrsStore();
    const wrapper = mount(CrsDialogHost, { global: { plugins: [vuetify] } });

    crsStore.requestProjectCrsEdit();
    await flushPromises();
    expect(wrapper.get('[data-testid="projectCrsDialogStub"]').attributes("data-show")).toBe(
      "true",
    );

    await wrapper.get('[data-testid="closeProjectStub"]').trigger("click");
    expect(crsStore.projectCrsEditRequest).toBe(false);
    wrapper.unmount();
  });
});
