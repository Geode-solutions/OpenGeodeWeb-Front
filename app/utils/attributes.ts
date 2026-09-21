interface AttributeRangeSource {
  min_values?: number[];
  max_values?: number[];
  min_value?: number;
  max_value?: number;
}

interface AttributeRange {
  min: number;
  max: number;
}

export function getAttributeRange(
  currentAttribute: AttributeRangeSource | undefined | null,
  compIndex: number = 0,
): AttributeRange {
  if (!currentAttribute) {
    return { min: 0, max: 1 };
  }

  const { min_values, max_values, min_value, max_value } = currentAttribute;
  let min = 0;
  let max = 1;

  const min_at_index = min_values?.[compIndex];
  if (min_at_index !== undefined) {
    min = min_at_index;
  } else if (compIndex === 0 && min_value !== undefined) {
    min = min_value;
  }

  const max_at_index = max_values?.[compIndex];
  if (max_at_index !== undefined) {
    max = max_at_index;
  } else if (compIndex === 0 && max_value !== undefined) {
    max = max_value;
  }

  return { min, max };
}
