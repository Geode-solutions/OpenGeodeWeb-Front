// Third party imports
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import FileUploader from "@ogw_front/components/FileUploader.vue";
import TextureItem from "@ogw_front/components/Viewer/Options/TextureItem.vue";
import { vuetify } from "@ogw_tests/utils";

vi.setConfig({ testTimeout: 10_000 });

type BackRequest = (
  request: { schema: { $id: string } },
  options?: { response_function: (response: unknown) => void },
) => unknown;

let saveViewableFileResponse: unknown = undefined;

vi.mock(import("@ogw_front/stores/back") as Promise<unknown>, () => ({
  useBackStore: (): { request: unknown } => ({
    request: vi.fn<BackRequest>().mockImplementation(({ schema }, options) => {
      if (schema.$id.endsWith("save_viewable_file")) {
        options?.response_function(saveViewableFileResponse);
        return saveViewableFileResponse;
      }
      return { texture_coordinates: [] };
    }),
  }),
}));
vi.mock(import("@ogw_front/composables/batch_style") as Promise<unknown>, () => ({
  useBatchGroup: (): Ref<undefined> => ref<undefined>(undefined),
}));

async function uploadTexture(response: unknown): Promise<VueWrapper> {
  saveViewableFileResponse = response;
  const wrapper = await mountSuspended(TextureItem, {
    global: { plugins: [vuetify] },
    props: { dataId: "id", textureId: "", textureName: "" },
  });
  await flushPromises();
  wrapper.findComponent(FileUploader).vm.$emit("files_uploaded", [new File(["png"], "tex.png")]);
  await flushPromises();
  return wrapper;
}

function emittedIds(wrapper: VueWrapper): unknown[] {
  return (wrapper.emitted<[{ key: string; value: string }]>().update_value ?? [])
    .map(([payload]) => payload)
    .filter((payload) => payload.key === "id")
    .map((payload) => payload.value);
}

describe("texture item upload", () => {
  test("uses the first imported item as the texture", async () => {
    const wrapper = await uploadTexture({ data: [{ id: "texture_1" }, { id: "texture_2" }] });

    expect(emittedIds(wrapper)).toStrictEqual(["texture_1"]);
  });

  test("keeps the texture when nothing was imported", async () => {
    const wrapper = await uploadTexture({ data: [] });

    expect(emittedIds(wrapper)).toStrictEqual([]);
  });
});
