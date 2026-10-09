import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";

interface AttributeRangeInfo {
  min_values: number[];
  max_values: number[];
  no_data: boolean;
}

interface AttributeRangeParams {
  id: string;
  component_ids?: string[];
}

type AttributeElement = "vertex" | "edge" | "cell" | "polygon" | "polyhedron";

const backSchemas = back_schemas.opengeodeweb_back;

// Element whose attribute range is computed, for each *_attribute_names schema
const ATTRIBUTE_RANGE_ELEMENTS: Record<string, AttributeElement> = {
  [backSchemas.vertex_attribute_names.$id]: "vertex",
  [backSchemas.edge_attribute_names.$id]: "edge",
  [backSchemas.cell_attribute_names.$id]: "cell",
  [backSchemas.polygon_attribute_names.$id]: "polygon",
  [backSchemas.polyhedron_attribute_names.$id]: "polyhedron",
  [backSchemas.model_component_vertex_attribute_names.$id]: "vertex",
  [backSchemas.model_component_edge_attribute_names.$id]: "edge",
  [backSchemas.model_component_polygon_attribute_names.$id]: "polygon",
  [backSchemas.model_component_polyhedron_attribute_names.$id]: "polyhedron",
};

async function fetchAttributeRange(
  namesSchema: JsonRpcSchema,
  params: AttributeRangeParams,
  attributeName: string,
): Promise<AttributeRangeInfo | undefined> {
  const element = ATTRIBUTE_RANGE_ELEMENTS[namesSchema.$id];
  if (element === undefined) {
    return undefined;
  }
  const backStore = useBackStore();
  try {
    return await backStore.request({
      schema: backSchemas.attribute_range,
      params: { ...params, element, attribute_name: attributeName },
    });
  } catch {
    return undefined;
  }
}

export { type AttributeRangeInfo, fetchAttributeRange };
