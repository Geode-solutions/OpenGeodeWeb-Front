export function getAttributeRange(currentAttribute, compIndex = 0) {
  if (!currentAttribute) {
    return { min: 0, max: 1 };
  }

  const { min_values, max_values, min_value, max_value } = currentAttribute;
  let min = 0;
  let max = 1;

  if (min_values && min_values[compIndex] !== undefined) {
    min = min_values[compIndex];
  } else if (compIndex === 0 && min_value !== undefined) {
    min = min_value;
  }

  if (max_values && max_values[compIndex] !== undefined) {
    max = max_values[compIndex];
  } else if (compIndex === 0 && max_value !== undefined) {
    max = max_value;
  }

  return { min, max };
}
