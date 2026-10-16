// Wslink ships no types for its chunking module; this describes what ws_client.ts uses.
declare module "wslink/src/WebsocketConnection/chunking.js" {
  interface Decoder {
    decode: (buffer: Uint8Array) => unknown;
  }
  function generateChunks(message: Uint8Array, maxSize: number): Generator<Uint8Array>;
  class UnChunker {
    public processChunk(chunk: Blob, decoderFactory: () => Decoder): Promise<unknown>;
    public releasePendingMessages(): void;
  }
  export { UnChunker, generateChunks };
}
