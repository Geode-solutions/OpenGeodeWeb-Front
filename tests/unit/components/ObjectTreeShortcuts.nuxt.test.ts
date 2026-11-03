// Third party imports
import { describe, expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";

const items = [
  {
    id: "group",
    title: "Group",
    children: [
      { id: "mesh1", title: "Mesh 1" },
      { id: "mesh2", title: "Mesh 2" },
    ],
  },
  { id: "mesh3", title: "Mesh 3" },
];

const cases = [
  {
    name: "ctrl+A activates every displayed leaf",
    props: { opened: ["group"] },
    event: { key: "a", ctrlKey: true },
    expected: [["mesh1", "mesh2", "mesh3"]],
  },
  {
    name: "cmd+A activates every displayed leaf",
    props: { opened: ["group"] },
    event: { key: "a", metaKey: true },
    expected: [["mesh1", "mesh2", "mesh3"]],
  },
  {
    name: "ctrl+A ignores leaves of collapsed groups",
    props: { opened: [] },
    event: { key: "A", ctrlKey: true },
    expected: [["mesh3"]],
  },
  {
    name: "escape clears the active items",
    props: { opened: ["group"], active: ["mesh1", "mesh3"] },
    event: { key: "Escape" },
    expected: [[]],
  },
  {
    name: "escape without active items emits nothing",
    props: { opened: ["group"] },
    event: { key: "Escape" },
    expected: undefined,
  },
];

describe("object tree keyboard shortcuts", () => {
  const pinia = setupActivePinia();

  test.each(cases)("$name", async ({ props, event, expected }) => {
    const wrapper = await mountSuspended(CommonTreeView, {
      global: { plugins: [vuetify, pinia] },
      props: { items, ...props },
    });
    await wrapper.find(".common-tree-view-wrapper").trigger("keydown", event);
    expect(wrapper.emitted("update:active")?.at(-1)).toStrictEqual(expected);
  });
});
