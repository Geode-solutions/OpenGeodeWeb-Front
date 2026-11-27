import type {
  AttributeItem,
  AttributeName,
  AttributeRangeMaximum,
  AttributeRangeMinimum,
  ColorRGBA,
} from "@geode/opengeodeweb-viewer/schema_types";
import type { AttributeColorMap } from "@ogw_front/types/attribute";

// The same fields while the user has not chosen them yet
type Undefinable<Fields> = { [Field in keyof Fields]: Fields[Field] | undefined };

// The attribute of a data, and the item of it, that colors the data
interface AttributeSelection {
  name: AttributeName;
  item: AttributeItem;
}

interface AttributeBounds {
  minimum: AttributeRangeMinimum;
  maximum: AttributeRangeMaximum;
}

interface AttributeColorMapped {
  colorMap: AttributeColorMap;
}

// What is kept of an attribute coloring when another attribute is picked
interface AttributeStoredConfig
  extends Undefinable<AttributeBounds>, Undefinable<AttributeColorMapped> {
  no_data_color: ColorRGBA;
}

// The input of an attribute coloring while the user has not chosen all of it yet
interface AttributeInput
  extends
    Undefinable<AttributeSelection>,
    Undefinable<AttributeBounds>,
    Undefinable<AttributeColorMapped> {
  no_data_color?: ColorRGBA;
}

interface ValidAttributeInput extends AttributeSelection, AttributeBounds, AttributeColorMapped {
  no_data_color?: ColorRGBA;
}

interface AttributeState extends Partial<AttributeSelection> {
  storedConfigs?: Record<
    AttributeName,
    { lastItem: AttributeItem } & Record<string, AttributeStoredConfig>
  >;
}

export type {
  AttributeBounds,
  AttributeColorMapped,
  AttributeInput,
  AttributeSelection,
  AttributeState,
  AttributeStoredConfig,
  ValidAttributeInput,
};
