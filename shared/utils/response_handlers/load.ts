import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";

interface AllowedObject {
  readonly is_loadable: number;
  readonly object_priority?: number;
  readonly loadable_family?: string;
}
type AllowedObjectMap = Partial<Record<GeodeObjectType, AllowedObject>>;
// Mirrors the allowed_objects route response
interface AllowedObjectsResponse {
  readonly allowed_objects: AllowedObjectMap;
  // One type per content of the file, empty when the user has to choose
  readonly objects_to_load: readonly GeodeObjectType[];
}

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".") + 1);
}

// The types of a map of allowed objects
function allowedObjectTypes(objectMap: AllowedObjectMap): GeodeObjectType[] {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Object.keys loses the key type of the map
  return Object.keys(objectMap) as GeodeObjectType[];
}

function getObject(objectMap: AllowedObjectMap, key: GeodeObjectType): AllowedObject {
  const object = objectMap[key];
  if (!object) {
    throw new Error(`Unknown geode object key: ${key}`);
  }
  return object;
}

function intersectAllowedObjects(allowedObjectsList: readonly AllowedObjectMap[]): {
  commonKeys: GeodeObjectType[];
  allKeys: GeodeObjectType[];
  mergedAllowedObjects: AllowedObjectMap;
} {
  const allKeys = [...new Set(allowedObjectsList.flatMap((object) => allowedObjectTypes(object)))];
  const commonKeys = allKeys.filter((key) => allowedObjectsList.every((object) => key in object));

  const mergedEntries = commonKeys.map((key): [GeodeObjectType, AllowedObject] => {
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
  readonly candidates: GeodeObjectType[];
  // Types the backend selected to load every content of the file, empty when the user has to choose
  readonly selectedGeodeObjects: GeodeObjectType[];
}

function sortCandidates(objectMap: AllowedObjectMap): GeodeObjectType[] {
  return allowedObjectTypes(objectMap)
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
