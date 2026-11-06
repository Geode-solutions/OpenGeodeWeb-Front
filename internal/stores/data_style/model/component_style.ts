import type { AttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_types";

function groupBy(componentIds: string[], key: (componentId: string) => string): string[][] {
  const groups: Record<string, string[]> = {};
  for (const componentId of componentIds) {
    const groupKey = key(componentId);
    groups[groupKey] ??= [];
    groups[groupKey].push(componentId);
  }
  return Object.values(groups);
}

interface AttributeState {
  name?: string;
  item?: number;
  storedConfigs?: Record<string, { lastItem: number } & Record<string, AttributeStoredConfig>>;
}

export { groupBy };
export type { AttributeState };
