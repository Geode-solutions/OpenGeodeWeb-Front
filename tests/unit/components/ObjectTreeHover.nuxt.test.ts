// Third party imports
import { describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import GlobalObjects from "@ogw_front/components/Viewer/ObjectTree/Views/GlobalObjects.vue";
import ModelTree from "@ogw_front/components/Viewer/ObjectTree/Views/ModelTree.vue";

const MODEL_ID = "model";
const MESH_ID = "mesh";
const BLOCK_VIEWER_ID = 3;

const onHoverEnter =
  vi.fn<(id: string, provider: unknown, type: string, immediate: boolean) => void>();
const onHoverLeave = vi.fn<(id: string) => void>();

vi.mock(import("@ogw_front/composables/hover_highlight") as Promise<unknown>, () => ({
  useHoverhighlight: (): Record<string, unknown> => ({
    onHoverEnter,
    onHoverLeave,
  }),
}));
vi.mock(import("@ogw_front/composables/model_tree") as Promise<unknown>, () => ({
  useModelTree: (): Record<string, unknown> => ({
    isLoading: ref(false),
    localCategories: ref([]),
    cache: ref({}),
    collectionTypes: ref([]),
    selection: ref([]),
    updateVisibility: vi.fn<() => void>(),
  }),
}));

const meshItem = { raw: { id: MESH_ID, viewer_object_type: "mesh" } };
const blockItem = { raw: { id: "block", category: "Block", viewer_id: BLOCK_VIEWER_ID } };

const cases = [
  { name: "global objects", component: GlobalObjects, props: {}, item: meshItem },
  { name: "model tree", component: ModelTree, props: { id: MODEL_ID }, item: blockItem },
];

describe("object tree hover highlight", () => {
  const pinia = setupActivePinia();

  test.each(cases)("$name forwards the immediate flag", async ({ component, props, item }) => {
    const wrapper = await mountSuspended(component, {
      global: { plugins: [vuetify, pinia], stubs: { CommonTreeView: true } },
      props,
    });
    const tree = wrapper.findComponent(CommonTreeView);

    onHoverEnter.mockClear();
    tree.vm.$emit("hover:enter", { item, immediate: true });
    expect(onHoverEnter).toHaveBeenCalledWith(
      expect.any(String),
      expect.anything(),
      expect.any(String),
      true,
    );

    onHoverEnter.mockClear();
    tree.vm.$emit("hover:enter", { item });
    expect(onHoverEnter).toHaveBeenCalledWith(
      expect.any(String),
      expect.anything(),
      expect.any(String),
      false,
    );
  });
});

describe("global objects hover of an image", () => {
  const pinia = setupActivePinia();

  test.each(["RasterImage2D", "RasterImage3D"])(
    "a %s is not highlighted",
    async (geode_object_type) => {
      const wrapper = await mountSuspended(GlobalObjects, {
        global: { plugins: [vuetify, pinia], stubs: { CommonTreeView: true } },
      });
      const tree = wrapper.findComponent(CommonTreeView);
      const item = { raw: { id: "image", viewer_object_type: "image", geode_object_type } };

      onHoverEnter.mockClear();
      onHoverLeave.mockClear();
      tree.vm.$emit("hover:enter", { item, immediate: true });
      tree.vm.$emit("hover:enter", { item });
      tree.vm.$emit("hover:leave", { item });

      expect(onHoverEnter).not.toHaveBeenCalled();
      expect(onHoverLeave).not.toHaveBeenCalled();
    },
  );
});
