interface AllowedObject {
  readonly is_loadable: number;
  readonly object_priority?: number;
}
type AllowedObjectMap = Record<string, AllowedObject>;

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

function selectGeodeObject(objectMap: AllowedObjectMap): string | undefined {
  const objectKeys = Object.keys(objectMap);
  if (objectKeys.length === 0) {
    return undefined;
  }
  const [firstKey] = objectKeys;
  if (
    objectKeys.length === 1 &&
    firstKey !== undefined &&
    getObject(objectMap, firstKey).is_loadable > 0
  ) {
    return firstKey;
  }

  const highestLoadScore = Math.max(
    ...objectKeys.map((key) => getObject(objectMap, key).is_loadable),
  );
  if (highestLoadScore <= 0) {
    return undefined;
  }

  const bestScoreObjects = objectKeys.filter(
    (key) => getObject(objectMap, key).is_loadable === highestLoadScore,
  );
  if (bestScoreObjects.length === 1) {
    return bestScoreObjects[0];
  }

  const highestPriority = Math.max(
    ...bestScoreObjects.map((key) => getObject(objectMap, key).object_priority ?? -Infinity),
  );
  const bestPriorityObjects = bestScoreObjects.filter(
    (key) => getObject(objectMap, key).object_priority === highestPriority,
  );
  if (highestPriority !== -Infinity && bestPriorityObjects.length === 1) {
    return bestPriorityObjects[0];
  }

  return undefined;
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
  selectedGeodeObject: string | undefined;
} {
  const { commonKeys, allKeys, mergedAllowedObjects } = intersectAllowedObjects(allowedObjectsList);

  const multipleFilesNoCommon =
    filenames.length > 1 && allKeys.length > 0 && commonKeys.length === 0;

  const selectedGeodeObject = selectGeodeObject(mergedAllowedObjects);

  return {
    mergedAllowedObjects,
    multipleFilesNoCommon,
    selectedGeodeObject,
  };
}

export { resolveAllowedObjects, getFileExtension };
