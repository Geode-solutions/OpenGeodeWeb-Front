// Third party imports
import { type Mock, beforeEach, describe, expect, test, vi } from "vitest";
import { createApp } from "vue";

// Local imports
import {
  BATCH_GROUP_KEY,
  createBatchGroup,
  useBatchGroup,
  useBatchStyle,
} from "@ogw_front/composables/batch_style";
import { setupActivePinia } from "@ogw_tests/utils";

const GROUP_IDS = ["surface_1", "surface_2", "surface_3"];
const FIRST_MAXIMUM = 10;
const SECOND_MINIMUM = 100;
const SECOND_MAXIMUM = 200;
const FIRST_RANGE: [number, number] = [0, FIRST_MAXIMUM];
const SECOND_RANGE: [number, number] = [SECOND_MINIMUM, SECOND_MAXIMUM];

type StyleAction = (id: string) => Promise<unknown>;

function batchStyleIn(
  targetIds: string[],
): ReturnType<typeof useBatchStyle> & ReturnType<typeof useBatchGroup> {
  const app = createApp({});
  app.provide(
    BATCH_GROUP_KEY,
    createBatchGroup(() => targetIds),
  );
  return app.runWithContext(() => ({ ...useBatchStyle(), ...useBatchGroup("surface_1") }));
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
    const { applyBatchStyle } = batchStyleIn([]);
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

  test("applies each data of the group its own range", async () => {
    const { applyBatchRange, withRangesPerData } = batchStyleIn(["surface_1", "surface_2"]);
    const ranges = new Map([
      ["surface_1", FIRST_RANGE],
      ["surface_2", SECOND_RANGE],
    ]);
    const range = withRangesPerData([...FIRST_RANGE], ranges);
    const rangePerData: Record<string, [number, number]> = {};

    await applyBatchRange("surface_1", range, (targetId, minimum, maximum) => {
      rangePerData[targetId] = [minimum, maximum];
    });

    expect(rangePerData).toStrictEqual({ surface_1: FIRST_RANGE, surface_2: SECOND_RANGE });
  });

  test("applies the same range to every data of the group", async () => {
    const { applyBatchRange } = batchStyleIn(["surface_1", "surface_2"]);
    const rangePerData: Record<string, [number, number]> = {};

    await applyBatchRange("surface_1", FIRST_RANGE, (targetId, minimum, maximum) => {
      rangePerData[targetId] = [minimum, maximum];
    });

    expect(rangePerData).toStrictEqual({ surface_1: FIRST_RANGE, surface_2: FIRST_RANGE });
  });
});
