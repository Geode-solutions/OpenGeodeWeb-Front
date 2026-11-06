function groupBy(componentIds: string[], key: (componentId: string) => string): string[][] {
  const groups: Record<string, string[]> = {};
  for (const componentId of componentIds) {
    const groupKey = key(componentId);
    groups[groupKey] ??= [];
    groups[groupKey].push(componentId);
  }
  return Object.values(groups);
}

export { groupBy };
