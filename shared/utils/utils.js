function getFileExtension(filename) {
  return filename.slice(filename.lastIndexOf(".") + 1);
}

function selectGeodeObject(objectMap) {
  const objectKeys = Object.keys(objectMap);
  if (objectKeys.length === 0) {
    return undefined;
  }
  if (objectKeys.length === 1 && objectMap[objectKeys[0]].is_loadable > 0) {
    return objectKeys[0];
  }

  const highestLoadScore = Math.max(...objectKeys.map((key) => objectMap[key].is_loadable));
  if (highestLoadScore <= 0) {
    return undefined;
  }

  const bestScoreObjects = objectKeys.filter(
    (key) => objectMap[key].is_loadable === highestLoadScore,
  );
  if (bestScoreObjects.length === 1) {
    return bestScoreObjects[0];
  }

  const highestPriority = Math.max(
    ...bestScoreObjects.map((key) => objectMap[key].object_priority ?? -Infinity),
  );
  const bestPriorityObjects = bestScoreObjects.filter(
    (key) => objectMap[key].object_priority === highestPriority,
  );
  if (highestPriority !== -Infinity && bestPriorityObjects.length === 1) {
    return bestPriorityObjects[0];
  }

  return undefined;
}

function intersectAllowedObjects(allowedObjectsList) {
  const allKeys = [...new Set(allowedObjectsList.flatMap((object) => Object.keys(object)))];
  const commonKeys = allKeys.filter((key) => allowedObjectsList.every((object) => key in object));

  const merged = {};
  for (const key of commonKeys) {
    const loadScores = allowedObjectsList.map((object) => object[key].is_loadable);
    const priorities = allowedObjectsList
      .map((object) => object[key].object_priority)
      .filter((priority) => priority !== undefined);

    merged[key] = { is_loadable: Math.min(...loadScores) };
    if (priorities.length > 0) {
      merged[key].object_priority = Math.max(...priorities);
    }
  }

  return { commonKeys, allKeys, merged };
}


function deriveAllowedObjects(filenames, allowedObjectsList) {
  const { commonKeys, allKeys, merged } = intersectAllowedObjects(allowedObjectsList);

  const multipleFilesNoCommon =
    filenames.length > 1 && allKeys.length > 0 && commonKeys.length === 0;


  const selectedGeodeObject = selectGeodeObject(merged);

  return {
    allowed_objects: merged,
    multipleFilesNoCommon,
    selectedGeodeObject,
  };
}

export { deriveAllowedObjects, getFileExtension };