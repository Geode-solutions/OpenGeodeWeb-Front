const EXPECTED_LENGTH = 1;
const FIRST_INDEX = 0;
const LOADABLE_SCORE = 1;

interface AllowedObjectInfo {
  is_loadable: boolean | number;
  object_priority?: number;
}
interface AllowedObjectsResponse {
  allowed_objects: Record<string, AllowedObjectInfo>;
}

export type { AllowedObjectInfo, AllowedObjectsResponse };
export { EXPECTED_LENGTH, FIRST_INDEX, LOADABLE_SCORE };
