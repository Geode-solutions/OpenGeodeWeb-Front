const EXPECTED_LENGTH = 1;
const FIRST_INDEX = 0;
const LOADABLE_SCORE = 1;

interface AllowedObjectInfo {
  is_loadable: boolean | number;
  object_priority?: number;
  loadable_family?: string;
}
interface AllowedObjectsResponse {
  allowed_objects: Record<string, AllowedObjectInfo>;
  // Types the backend selected to load the whole file, empty when the user has to choose
  objects_to_load: string[];
}

export type { AllowedObjectInfo, AllowedObjectsResponse };
export { EXPECTED_LENGTH, FIRST_INDEX, LOADABLE_SCORE };
