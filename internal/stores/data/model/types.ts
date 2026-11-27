import type { GeodeIdentified, ModelComponentId } from "@ogw_front/types/identifiers";
import type {
  ModelComponentName,
  ModelComponentType,
  ModelComponentViewerId,
} from "@ogw_front/types/model";

// A model component as the back sends it, with the ids of its related components
interface ModelComponentInput extends GeodeIdentified {
  type: ModelComponentType;
  viewer_id: ModelComponentViewerId;
  name: ModelComponentName;
  is_active: boolean;
  boundaries?: ModelComponentId[];
  internals?: ModelComponentId[];
  items?: ModelComponentId[];
}

export type { ModelComponentInput };
