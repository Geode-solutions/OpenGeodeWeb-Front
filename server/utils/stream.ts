import type { ReadableStream as NodeReadableStream } from "node:stream/web";

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types
export function toNodeWebStream(stream: ReadableStream): NodeReadableStream {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return stream as NodeReadableStream;
}
