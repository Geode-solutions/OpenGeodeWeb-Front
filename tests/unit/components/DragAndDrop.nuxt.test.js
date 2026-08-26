// Third party imports
import { describe, expect, test } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import DragAndDrop from "@ogw_front/components/DragAndDrop";

describe("drag and drop", () => {
  const pinia = setupActivePinia();

  test("ignores dropped files that do not match accept prop", async () => {
    const wrapper = await mountSuspended(DragAndDrop, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: {
        accept: ".vtp,.vts",
      },
    });

    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [new File(["extension_data"], "plugin.vext")],
        types: ["Files"],
      },
    });

    globalThis.dispatchEvent(dropEvent);
    await flushPromises();

    expect(wrapper.emitted("files-selected")).toBeUndefined();
  });

  test("emits files-selected when dropped file matches accept prop", async () => {
    const wrapper = await mountSuspended(DragAndDrop, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: {
        accept: ".vtp,.vts",
      },
    });

    const validFile = new File(["mesh_data"], "model.vtp");
    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [validFile],
        types: ["Files"],
      },
    });

    globalThis.dispatchEvent(dropEvent);
    await flushPromises();

    expect(wrapper.emitted("files-selected")).toBeDefined();
    expect(wrapper.emitted("files-selected")[0][0]).toStrictEqual([validFile]);
  });

  test("accepts general files but excludes .vext when accept prop is empty", async () => {
    const wrapper = await mountSuspended(DragAndDrop, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: {
        accept: "",
      },
    });

    const dataFile = new File(["any_data"], "data_file.txt");
    const extensionFile = new File(["extension_data"], "plugin.vext");
    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [dataFile, extensionFile],
        types: ["Files"],
      },
    });

    globalThis.dispatchEvent(dropEvent);
    await flushPromises();

    expect(wrapper.emitted("files-selected")).toBeDefined();
    expect(wrapper.emitted("files-selected")[0][0]).toStrictEqual([dataFile]);
  });
});
