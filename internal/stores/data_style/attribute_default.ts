import type { AttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";

// What an attribute coloring starts with, before a range or a color map is stored for it
function defaultAttributeStoredConfig(): AttributeStoredConfig {
  return {
    minimum: undefined,
    maximum: undefined,
    colorMap: undefined,
    no_data_color: DEFAULT_NO_DATA_COLOR,
  };
}

export { defaultAttributeStoredConfig };
