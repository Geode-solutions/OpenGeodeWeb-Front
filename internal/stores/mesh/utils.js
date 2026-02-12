export function ensureAttributeEntry(coloring_category, name) {
  if (!coloring_category.storedConfigs[name]) {
    coloring_category.storedConfigs[name] = {}
  }
}
