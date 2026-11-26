import type { ModelComponentId } from "@ogw_front/types/identifiers";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";

function groupBy(
  componentIds: ModelComponentId[],
  key: (componentId: ModelComponentId) => string,
): NonEmptyArray<ModelComponentId>[] {
  const groups: Record<string, NonEmptyArray<ModelComponentId>> = {};
  for (const componentId of componentIds) {
    const groupKey = key(componentId);
    const group = groups[groupKey];
    if (group === undefined) {
      groups[groupKey] = [componentId];
    } else {
      group.push(componentId);
    }
  }
  return Object.values(groups);
}

export { groupBy };
