function compareSelections<Item>(
  current: readonly Item[],
  previous: readonly Item[],
): { added: Item[]; removed: Item[] } {
  const added = current.filter((item) => !previous.includes(item));
  const removed = previous.filter((item) => !current.includes(item));
  return { added, removed };
}

interface DataMenuPayload {
  event: MouseEvent;
  itemId: string;
  context_type?: undefined;
}

interface GeodeObjectTypeMenuPayload {
  event: MouseEvent;
  itemId: string;
  context_type: "geode_object_type";
  targetIds: string[];
}

interface ModelComponentMenuPayload {
  event: MouseEvent;
  itemId: string;
  context_type: "model_component" | "model_component_type";
  modelId: string;
  modelComponentType?: string;
  targetComponentIds?: string[];
}

type TreeMenuPayload = DataMenuPayload | GeodeObjectTypeMenuPayload | ModelComponentMenuPayload;

export { compareSelections };
export type {
  DataMenuPayload,
  GeodeObjectTypeMenuPayload,
  ModelComponentMenuPayload,
  TreeMenuPayload,
};
