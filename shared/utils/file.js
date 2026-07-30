import _ from "lodash";

function assertFile(file) {
  if (!(file instanceof File)) {
    throw new Error("file must be an instance of File");
  }
}

function hasBody(params) {
  if (params instanceof FormData || params instanceof Blob) {
    return true;
  }
  return !_.isEmpty(params);
}
export { assertFile, hasBody };