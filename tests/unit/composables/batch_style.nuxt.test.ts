// Third party imports
import { type Mock, beforeEach, describe, expect, test, vi } from "vitest";

// Local imports
import { runWithBatchTargets, useBatchStyle } from "@ogw_front/composables/batch_style";
import { setupActivePinia } from "@ogw_tests/utils";
import { useMenuStore } from "@ogw_front/stores/menu";

const GROUP_IDS = ["surface_1", "surface_2", "surface_3"];

type StyleAction = (id: string) => Promise<unknown>;

function openGroupMenu(): void {
  const menuStore = useMenuStore();
  menuStore.current_meta_data = {
    viewer_type: "mesh",
    geode_object_type: "TriangulatedSurface3D",
    targetIds: GROUP_IDS,
  };
}

function styleAction(): Mock<StyleAction> {
  return vi.fn<StyleAction>().mockResolvedValue(undefined);
}

function styledIds(action: ReturnType<typeof styleAction>): string[] {
  return action.mock.calls.map(([styledId]) => styledId).toSorted();
}

describe("batch style composable", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("applies the action to every data of the group when the menu targets a group", async () => {
    openGroupMenu();
    const { applyBatchStyle } = useBatchStyle();
    const action = styleAction();

    await applyBatchStyle("surface_1", action);

    expect(styledIds(action)).toStrictEqual(GROUP_IDS);
  });

  test("applies the action only to the given data when the menu targets a single data", async () => {
    const { applyBatchStyle } = useBatchStyle();
    const action = styleAction();

    await applyBatchStyle("surface_1", action);

    expect(styledIds(action)).toStrictEqual(["surface_1"]);
  });

  test("ignores the group targets when the styled data is not part of the group", async () => {
    openGroupMenu();
    const { applyBatchStyle } = useBatchStyle();
    const action = styleAction();

    await applyBatchStyle("other_data", action);

    expect(styledIds(action)).toStrictEqual(["other_data"]);
  });

  test("runWithBatchTargets restricts the action to the given targets", async () => {
    openGroupMenu();
    const { applyBatchStyle } = useBatchStyle();
    const action = styleAction();

    let pending: Promise<void> = Promise.resolve();
    runWithBatchTargets(["surface_2"], () => {
      pending = applyBatchStyle("surface_1", action);
    });
    await pending;

    expect(styledIds(action)).toStrictEqual(["surface_2"]);
  });
});
