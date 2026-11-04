import {
  MESH_ELEMENT_KINDS,
  MODEL_COMPONENT_ATTRIBUTE_SCHEMAS,
  MODEL_COMPONENT_KINDS,
} from "@ogw_front/utils/attributes";
import type { AttributeSource } from "@ogw_front/utils/threshold";
import { attributeSchemas } from "@ogw_front/composables/attribute_coloring_style";
import type { useDataStore } from "@ogw_front/stores/data";

function attributeSource(
  kind: string,
  title: string,
  params: { id: string; component_ids?: string[] },
  modelType?: string,
): AttributeSource {
  const schemas = attributeSchemas(modelType === undefined ? "" : "model_component_", kind);
  return {
    title: `${title}${kind} attribute`,
    schemas,
    timeStepKey:
      modelType === undefined
        ? schemas.names.$id
        : (MODEL_COMPONENT_ATTRIBUTE_SCHEMAS[modelType]?.[kind]?.$id ?? schemas.names.$id),
    params,
    location: kind === "vertex" ? "point" : "cell",
  };
}

async function fetchSources(
  dataStore: ReturnType<typeof useDataStore>,
  id: string,
): Promise<AttributeSource[]> {
  const item = await dataStore.item(id);
  if (item.viewer_type !== "model") {
    return ["vertex", MESH_ELEMENT_KINDS[item.geode_object_type]]
      .filter((kind): kind is string => kind !== undefined)
      .map((kind) => attributeSource(kind, "", { id }));
  }
  const modelSources = await Promise.all(
    Object.entries(MODEL_COMPONENT_KINDS).map(async ([type, kinds]) => {
      const component_ids = await dataStore.getMeshComponentGeodeIds(id, type);
      if (component_ids.length === 0) {
        return [];
      }
      return kinds.map((kind) => attributeSource(kind, `${type} `, { id, component_ids }, type));
    }),
  );
  return modelSources.flat();
}

export { fetchSources };
