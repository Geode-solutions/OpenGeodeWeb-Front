// Style values read back from the database may be missing: skip the viewer request rather than send an invalid one.
async function whenDefined<Value, Result>(
  value: Value | undefined,
  apply: (value: Value) => Promise<Result>,
): Promise<Result | undefined> {
  if (value === undefined) {
    return undefined;
  }
  const result = await apply(value);
  return result;
}

export { whenDefined };
