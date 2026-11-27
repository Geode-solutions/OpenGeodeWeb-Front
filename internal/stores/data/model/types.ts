import type { GeodeIdentified, ModelComponentId } from "@ogw_front/types/identifiers";

// A model component as the back sends it, with the ids of its related components
interface ModelComponentInput extends GeodeIdentified {
  type: string;
  viewer_id: string | number;
  name: string;
  is_active: boolean;
  boundaries?: ModelComponentId[];
  internals?: ModelComponentId[];
  items?: ModelComponentId[];
}

export type { ModelComponentInput };
