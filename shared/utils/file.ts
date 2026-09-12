import _ from "lodash";

function assertFile(file: unknown): asserts file is File {
  console.log("[ASSERT_FILE] Asserting file", { file });
  if (!(file instanceof File)) {
    throw new Error("file must be an instance of File");
  }
}

function hasBody(params: unknown): boolean {
  if (params instanceof FormData || params instanceof Blob) {
    return true;
  }
  return !_.isEmpty(params);
}
export { assertFile, hasBody };
