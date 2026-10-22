import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

function groupBy(componentIds: string[], key: (componentId: string) => string): string[][] {
  const groups: Record<string, string[]> = {};
  for (const componentId of componentIds) {
    const groupKey = key(componentId);
    groups[groupKey] ??= [];
    groups[groupKey].push(componentId);
  }
  return Object.values(groups);
}

interface AttributeStoredConfig {
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  no_data_color: RGBAColor;
}

interface AttributeState {
  name?: string;
  item?: number;
  storedConfigs?: Record<string, { lastItem: number } & Record<string, AttributeStoredConfig>>;
}

export { groupBy };
export type { AttributeState, AttributeStoredConfig };
