// Third party imports
import { describe, expect, test } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import DragAndDrop from "@ogw_front/components/DragAndDrop.vue";

function fileEntry(file: File): object {
  return {
    isFile: true,
    isDirectory: false,
    name: file.name,
    file: (resolve: (value: File) => void): void => {
      resolve(file);
    },
  };
}

function directoryEntry(name: string, children: unknown[]): object {
  return {
    isFile: false,
    isDirectory: true,
    name,
    createReader: (): object => {
      const batches = [children, []];
      return {
        readEntries: (resolve: (entries: unknown[]) => void): void => {
          resolve(batches.shift() ?? []);
        },
      };
    },
  };
}

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
    expect(wrapper.emitted("files-selected")?.[0]?.[0]).toStrictEqual([validFile]);
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
    expect(wrapper.emitted("files-selected")?.[0]?.[0]).toStrictEqual([dataFile]);
  });

  test("keeps the folder tree of a dropped directory", async () => {
    const wrapper = await mountSuspended(DragAndDrop, {
      global: { plugins: [vuetify, pinia] },
      props: { accept: ".pvd", directory: true },
    });
    const nested = directoryEntry("vtkOutput", [fileEntry(new File(["vtu"], "rank_0.vtu"))]);
    const folder = directoryEntry("spe10", [fileEntry(new File(["pvd"], "vtkOutput.pvd")), nested]);
    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [],
        types: ["Files"],
        items: [{ webkitGetAsEntry: (): object => folder }],
      },
    });

    globalThis.dispatchEvent(dropEvent);
    await flushPromises();

    expect(wrapper.emitted("files-selected")?.[0]?.[0]).toMatchObject([
      { relativePath: "spe10/vtkOutput.pvd" },
      { relativePath: "spe10/vtkOutput/rank_0.vtu" },
    ]);
  });

  test("ignores dropped folders outside folder mode", async () => {
    const wrapper = await mountSuspended(DragAndDrop, {
      global: { plugins: [vuetify, pinia] },
      props: { accept: "" },
    });
    const pvdFile = new File(["pvd"], "vtkOutput.pvd");
    const folder = directoryEntry("vtkOutput", [fileEntry(new File(["vtu"], "rank_0.vtu"))]);
    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [],
        types: ["Files"],
        items: [
          { webkitGetAsEntry: (): object => folder },
          { webkitGetAsEntry: (): object => fileEntry(pvdFile) },
        ],
      },
    });

    globalThis.dispatchEvent(dropEvent);
    await flushPromises();

    expect(wrapper.emitted("files-selected")?.[0]?.[0]).toStrictEqual([pvdFile]);
    expect(wrapper.emitted("folders-ignored")).toHaveLength(1);
  });

  test("reports a dropped directory that cannot be read", async () => {
    const wrapper = await mountSuspended(DragAndDrop, {
      global: { plugins: [vuetify, pinia] },
      props: { directory: true },
    });
    const folder = {
      isFile: false,
      isDirectory: true,
      name: "broken",
      createReader: (): object => ({
        readEntries: (_resolve: unknown, reject: (error: Error) => void): void => {
          reject(new Error("read failed"));
        },
      }),
    };
    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [],
        types: ["Files"],
        items: [{ webkitGetAsEntry: (): object => folder }],
      },
    });

    globalThis.dispatchEvent(dropEvent);
    await flushPromises();

    expect(wrapper.emitted("files-selected")).toBeUndefined();
    expect(wrapper.emitted("folder-read-error")).toStrictEqual([["read failed"]]);
  });
});
