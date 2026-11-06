import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

// The same fields while the user has not chosen them yet
type Undefinable<Fields> = { [Field in keyof Fields]: Fields[Field] | undefined };

// The attribute of a data, and the item of it, that colors the data
interface AttributeSelection {
  name: string;
  item: number;
}

interface AttributeRange {
  minimum: number;
  maximum: number;
}

interface AttributeColorMap {
  colorMap: string;
}

interface ValidAttributeInput extends AttributeSelection, AttributeRange, AttributeColorMap {
  no_data_color?: RGBAColor;
}

interface AttributeInput
  extends
    Undefinable<AttributeSelection>,
    Undefinable<AttributeRange>,
    Undefinable<AttributeColorMap> {
  no_data_color?: RGBAColor;
}

// What is kept of an attribute coloring when another attribute is picked
interface AttributeStoredConfig
  extends Undefinable<AttributeRange>, Undefinable<AttributeColorMap> {
  no_data_color: RGBAColor;
}

interface AttributeState extends Partial<AttributeSelection> {
  storedConfigs?: Record<string, { lastItem: number } & Record<string, AttributeStoredConfig>>;
}

export type {
  AttributeColorMap,
  AttributeInput,
  AttributeRange,
  AttributeSelection,
  AttributeState,
  AttributeStoredConfig,
  ValidAttributeInput,
};
