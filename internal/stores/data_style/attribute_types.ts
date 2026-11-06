import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

// The same fields while the user has not chosen them yet
type Undefinable<Fields> = { [Field in keyof Fields]: Fields[Field] | undefined };

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

export type { AttributeBounds, AttributeColorMapped, AttributeStoredConfig };
