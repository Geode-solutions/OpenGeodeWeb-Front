import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface ColorGroup {
  color: RGBAColor | undefined;
  blocks_ids: string[];
}

interface AttributeGroup {
  name: string;
  item: number;
  minimum: number;
  maximum: number;
  colorMap: string;
  no_data_color?: RGBAColor;
  blocks_ids: string[];
}

export type { AttributeGroup, ColorGroup };
