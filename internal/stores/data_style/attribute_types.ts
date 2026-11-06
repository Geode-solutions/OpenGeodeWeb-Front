import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

// The same fields while the user has not chosen them yet
type Undefinable<Fields> = { [Field in keyof Fields]: Fields[Field] | undefined };

// The attribute of a data, and the item of it, that colors the data
interface AttributeSelection {
  name: string;
  item: number;
}

interface AttributeBounds {
  minimum: number;
  maximum: number;
}

interface AttributeColorMapped {
  colorMap: string;
}

// What is kept of an attribute coloring when another attribute is picked
interface AttributeStoredConfig
  extends Undefinable<AttributeBounds>, Undefinable<AttributeColorMapped> {
  no_data_color: RGBAColor;
}

interface AttributeState extends Partial<AttributeSelection> {
  storedConfigs?: Record<string, { lastItem: number } & Record<string, AttributeStoredConfig>>;
}

export type {
  AttributeBounds,
  AttributeColorMapped,
  AttributeSelection,
  AttributeState,
  AttributeStoredConfig,
};
