export function ensureAttributeEntry(coloring_category, name) {
  if (!coloring_category.attributes[name]) {
    coloring_category.attributes[name] = {}
  }
}
