import type { AttributeSchemas } from "@ogw_front/utils/attribute_range";

interface AttributeSource {
  title: string;
  schemas: AttributeSchemas;
  timeStepKey: string;
  params: { id: string; component_ids?: string[] };
  location: "point" | "cell";
}

interface AttributeInfo {
  attribute_name: string;
  nb_items: number;
  time_steps?: number[];
  [key: string]: unknown;
}

export type { AttributeInfo, AttributeSource };
