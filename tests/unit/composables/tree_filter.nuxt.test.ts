// Third party imports
import { describe, expect, test } from "vitest";

// Local imports
import { useTreeFilter } from "@ogw_front/composables/tree_filter";

const SHARED_GEODE_ID = "01a08187-2c4c-7e64-85c5-52c3439f0626";
const OTHER_GEODE_ID = "01a0fbc4-ec02-7265-baeb-c2c0fa77b3bd";
const PREFIX_LENGTH = 13;
const DATA_ID_LENGTH = 32;
const FIRST_ID = "a".repeat(DATA_ID_LENGTH);
const SECOND_ID = "b".repeat(DATA_ID_LENGTH);
const THIRD_ID = "c".repeat(DATA_ID_LENGTH);

interface TestItem {
  id: string;
  title: string;
  geode_id?: string;
  children?: TestItem[];
}

function buildItems(): TestItem[] {
  return [
    {
      id: "BRep",
      title: "BRep",
      children: [
        { id: FIRST_ID, title: "cube", geode_id: SHARED_GEODE_ID },
        { id: SECOND_ID, title: "cube copy", geode_id: SHARED_GEODE_ID },
        { id: THIRD_ID, title: "other", geode_id: OTHER_GEODE_ID },
      ],
    },
  ];
}

function firstGroupChildIds(
  groups: readonly { children?: readonly { id: unknown }[] }[],
): string[] {
  return (groups[0]?.children ?? []).map((child) => String(child.id));
}

describe("useTreeFilter geode_id", () => {
  test("a full geode_id returns every data sharing it", () => {
    const { search, processedItems } = useTreeFilter(buildItems());
    search.value = SHARED_GEODE_ID;
    expect(
      firstGroupChildIds(processedItems.value).toSorted((left, right) => left.localeCompare(right)),
    ).toStrictEqual([FIRST_ID, SECOND_ID]);
  });

  test("a geode_id prefix filters like title and id", () => {
    const { search, processedItems } = useTreeFilter(buildItems());
    search.value = SHARED_GEODE_ID.slice(0, PREFIX_LENGTH);
    expect(firstGroupChildIds(processedItems.value)).toHaveLength(2);
  });

  test("a group whose title matches but no child does is hidden", () => {
    const { search, processedItems } = useTreeFilter(buildItems());
    search.value = "BRep";
    expect(processedItems.value).toHaveLength(0);
  });

  test("sort by id orders objects by geode_id", () => {
    const items: TestItem[] = [
      {
        id: "BRep",
        title: "BRep",
        children: [
          { id: FIRST_ID, title: "first", geode_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" },
          { id: SECOND_ID, title: "second", geode_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
        ],
      },
    ];
    const { sortType, processedItems } = useTreeFilter(items, { recursiveSort: true });
    sortType.value = "id";
    expect(firstGroupChildIds(processedItems.value)).toStrictEqual([SECOND_ID, FIRST_ID]);
  });
});
