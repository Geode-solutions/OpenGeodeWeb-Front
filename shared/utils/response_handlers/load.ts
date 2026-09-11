interface AllowedObject {
  is_loadable: number;
  object_priority?: number;
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
  if (objectKeys.length === 1 && getObject(objectMap, objectKeys[0]!).is_loadable > 0) {
    return objectKeys[0];
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

function intersectAllowedObjects(allowedObjectsList: AllowedObjectMap[]): {
  commonKeys: string[];
  allKeys: string[];
  mergedAllowedObjects: AllowedObjectMap;
} {
  const allKeys = [...new Set(allowedObjectsList.flatMap((object) => Object.keys(object)))];
  const commonKeys = allKeys.filter((key) => allowedObjectsList.every((object) => key in object));

  const mergedAllowedObjects: AllowedObjectMap = {};
  for (const key of commonKeys) {
    const loadScores = allowedObjectsList.map((object) => getObject(object, key).is_loadable);
    const priorities = allowedObjectsList
      .map((object) => getObject(object, key).object_priority)
      .filter((priority): priority is number => priority !== undefined);

    mergedAllowedObjects[key] = { is_loadable: Math.min(...loadScores) };
    if (priorities.length > 0) {
      mergedAllowedObjects[key].object_priority = Math.max(...priorities);
    }
  }

  return { commonKeys, allKeys, mergedAllowedObjects };
}

function resolveAllowedObjects(filenames: string[], allowedObjectsList: AllowedObjectMap[]) {
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
