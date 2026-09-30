// Third party imports
import { type Mock, beforeEach, describe, expect, test, vi } from "vitest";
import { createApp } from "vue";

// Local imports
import {
  BATCH_GROUP_KEY,
  createBatchGroup,
  useBatchStyle,
} from "@ogw_front/composables/batch_style";
import { setupActivePinia } from "@ogw_tests/utils";

const GROUP_IDS = ["surface_1", "surface_2", "surface_3"];
const SECOND_MAXIMUM = 20;
const REFERENCE_RANGE: [number, number] = [0, 1];
const SECOND_RANGE: [number, number] = [0, SECOND_MAXIMUM];

type StyleAction = (id: string) => Promise<unknown>;

function batchStyleIn(
  targetIds: string[] | undefined,
): ReturnType<typeof useBatchStyle> & { group: ReturnType<typeof createBatchGroup> } {
  const app = createApp({});
  const group = createBatchGroup(() => targetIds);
  app.provide(BATCH_GROUP_KEY, group);
  return { ...app.runWithContext(() => useBatchStyle()), group };
}

function styleAction(): Mock<StyleAction> {
  return vi.fn<StyleAction>().mockResolvedValue(undefined);
}

function styledIds(action: Mock<StyleAction>): string[] {
  return action.mock.calls.map(([styledId]) => styledId).toSorted();
}

describe("batch style composable", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("applies the action to every data of the group", async () => {
    const { applyBatchStyle } = batchStyleIn(GROUP_IDS);
    const action = styleAction();

    await applyBatchStyle("surface_1", action);

    expect(styledIds(action)).toStrictEqual(GROUP_IDS);
  });

  test("applies the action only to the given data outside of a group", async () => {
    const { applyBatchStyle } = batchStyleIn(undefined);
    const action = styleAction();

    await applyBatchStyle("surface_1", action);

    expect(styledIds(action)).toStrictEqual(["surface_1"]);
  });

  test("ignores the group when the styled data is not part of it", async () => {
    const { applyBatchStyle } = batchStyleIn(GROUP_IDS);
    const action = styleAction();

    await applyBatchStyle("other_data", action);

    expect(styledIds(action)).toStrictEqual(["other_data"]);
  });

  test("applies each data its own range of the group", async () => {
    const { applyBatchRange, group } = batchStyleIn(["surface_1", "surface_2"]);
    group.value?.ranges.set("surface_2", SECOND_RANGE);
    const rangePerData: Record<string, [number, number]> = {};

    await applyBatchRange("surface_1", REFERENCE_RANGE, (targetId, minimum, maximum) => {
      rangePerData[targetId] = [minimum, maximum];
    });

    expect(rangePerData).toStrictEqual({ surface_1: REFERENCE_RANGE, surface_2: SECOND_RANGE });
  });
});
