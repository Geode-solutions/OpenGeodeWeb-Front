// An array holding at least one item
type NonEmptyArray<Item> = [Item, ...Item[]];

function isNonEmpty<Item>(items: Item[]): items is NonEmptyArray<Item> {
  return items.length > 0;
}

export type { NonEmptyArray };
export { isNonEmpty };
