// Style values read back from the database may be missing (or null by default, e.g. textures): skip the viewer request rather than send an invalid one.
async function whenDefined<Value, Result>(
  value: Value | null | undefined,
  apply: (value: Value) => Promise<Result>,
): Promise<Result | undefined> {
  if (value === undefined || value === null) {
    return undefined;
  }
  const result = await apply(value);
  return result;
}

export { whenDefined };
