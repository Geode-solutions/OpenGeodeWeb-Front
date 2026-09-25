import _ from "lodash";

const BYTES_PER_KIBIBYTE = 1024;
const KIBIBYTES_PER_MEBIBYTE = 1024;
const CHUNK_SIZE_MEBIBYTES = 8;
// Cloud hosting in front of the upload routes (Cloud Run/Firebase Hosting) enforces a hard ~32MB request body limit that no amount of server-side streaming can bypass, so uploads are always split into chunks comfortably under that cap. The single source of truth here keeps every uploader (OpenGeodeWeb-Front, Vease) and the routes that assemble the chunks in agreement.
const CHUNK_SIZE_BYTES = CHUNK_SIZE_MEBIBYTES * KIBIBYTES_PER_MEBIBYTE * BYTES_PER_KIBIBYTE;

function assertFile(file: unknown): asserts file is File {
  console.log("[ASSERT_FILE] Asserting file", { file });
  if (!(file instanceof File)) {
    throw new Error("file must be an instance of File");
  }
}

function hasBody(params: unknown): params is Blob | FormData | Record<string, unknown> {
  if (params instanceof FormData || params instanceof Blob) {
    return true;
  }
  return !_.isEmpty(params);
}
export { assertFile, BYTES_PER_KIBIBYTE, CHUNK_SIZE_BYTES, hasBody };
