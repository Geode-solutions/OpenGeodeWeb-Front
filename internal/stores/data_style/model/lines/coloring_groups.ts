import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface ColorGroup {
  color: RGBAColor | undefined;
  lines_ids: string[];
}

interface AttributeGroup {
  name: string;
  item: number;
  minimum: number;
  maximum: number;
  colorMap: string;
  no_data_color?: RGBAColor;
  lines_ids: string[];
}

export type { AttributeGroup, ColorGroup };
