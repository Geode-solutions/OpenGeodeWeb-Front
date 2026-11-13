interface AllowedObject {
  readonly is_loadable: number;
  readonly object_priority?: number;
  readonly loadable_family?: string;
}
type AllowedObjectMap = Record<string, AllowedObject>;
// Mirrors the allowed_objects route response
interface AllowedObjectsResponse {
  readonly allowed_objects: AllowedObjectMap;
  // One type per content of the file, empty when the user has to choose
  readonly objects_to_load: readonly string[];
}

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".") + 1);
}

function getObject(objectMap: AllowedObjectMap, key: string): AllowedObject {
  const object = objectMap[key];
  if (!object) {
    throw new Error(`Unknown geode object key: ${key}`);
  }
  return object;
}

function intersectAllowedObjects(allowedObjectsList: readonly AllowedObjectMap[]): {
  commonKeys: string[];
  allKeys: string[];
  mergedAllowedObjects: AllowedObjectMap;
} {
  const allKeys = [...new Set(allowedObjectsList.flatMap((object) => Object.keys(object)))];
  const commonKeys = allKeys.filter((key) => allowedObjectsList.every((object) => key in object));

  const mergedEntries = commonKeys.map((key): [string, AllowedObject] => {
    const loadScores = allowedObjectsList.map((object) => getObject(object, key).is_loadable);
    const priorities = allowedObjectsList
      .map((object) => getObject(object, key).object_priority)
      .filter((priority): priority is number => priority !== undefined);

    if (priorities.length > 0) {
      return [
        key,
        { is_loadable: Math.min(...loadScores), object_priority: Math.max(...priorities) },
      ];
    }
    return [key, { is_loadable: Math.min(...loadScores) }];
  });
  const mergedAllowedObjects: AllowedObjectMap = Object.fromEntries(mergedEntries);

  return { commonKeys, allKeys, mergedAllowedObjects };
}

function resolveAllowedObjects(
  filenames: readonly string[],
  allowedObjectsList: readonly AllowedObjectMap[],
): {
  mergedAllowedObjects: AllowedObjectMap;
  multipleFilesNoCommon: boolean;
} {
  const { commonKeys, allKeys, mergedAllowedObjects } = intersectAllowedObjects(allowedObjectsList);

  const multipleFilesNoCommon =
    filenames.length > 1 && allKeys.length > 0 && commonKeys.length === 0;

  // No automatic pick here: the backend is the only one selecting types, the user chooses
  return { mergedAllowedObjects, multipleFilesNoCommon };
}

interface FileAllowedObjects {
  readonly filename: string;
  // Loadable types only, sorted by best is_loadable then best object_priority
  readonly candidates: string[];
  // Types the backend selected to load every content of the file, empty when the user has to choose
  readonly selectedGeodeObjects: string[];
}

function sortCandidates(objectMap: AllowedObjectMap): string[] {
  return Object.keys(objectMap)
    .filter((key) => getObject(objectMap, key).is_loadable > 0)
    .toSorted((keyA, keyB) => {
      const objectA = getObject(objectMap, keyA);
      const objectB = getObject(objectMap, keyB);
      if (objectA.is_loadable !== objectB.is_loadable) {
        return objectB.is_loadable - objectA.is_loadable;
      }
      return (objectB.object_priority ?? -Infinity) - (objectA.object_priority ?? -Infinity);
    });
}

// Each file gets its own geode object types; files are no longer required to share one
function resolveAllowedObjectsPerFile(
  filenames: readonly string[],
  responses: readonly AllowedObjectsResponse[],
): FileAllowedObjects[] {
  return filenames.map((filename, index) => {
    const response = responses[index];
    return {
      filename,
      candidates: sortCandidates(response?.allowed_objects ?? {}),
      selectedGeodeObjects: [...(response?.objects_to_load ?? [])],
    };
  });
}

export { resolveAllowedObjects, resolveAllowedObjectsPerFile, getFileExtension };
export type { AllowedObjectMap, AllowedObjectsResponse, FileAllowedObjects };
