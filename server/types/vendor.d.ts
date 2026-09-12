// Minimal ambient typings for third-party packages used under server/ that ship no types of their own and have no @types/* package installed. Only the members this codebase actually uses are declared.
// This file declares ambient types for two separate untyped packages (`ws` and `busboy`); splitting it in two would just be file-count churn for a couple of small, always-imported-together vendor shims. Its short identifiers (`on`, `id`, ...) mirror the real, external APIs they type - renaming them here wouldn't change the names real callers already use.
// oxlint-disable eslint/max-classes-per-file, eslint/id-length

declare module "ws" {
  type RawData = string | Buffer | ArrayBuffer | Buffer[];

  class WebSocket {
    static readonly CONNECTING: number;
    static readonly OPEN: number;
    static readonly CLOSING: number;
    static readonly CLOSED: number;

    constructor(address: string);

    readyState: number;

    on(event: "open", listener: () => void): this;
    on(event: "message", listener: (data: RawData) => void): this;
    on(event: "close", listener: (code?: number, reason?: Buffer) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    once(event: string, listener: (...args: unknown[]) => void): this;

    send(data: string): void;
    close(): void;
  }

  export { WebSocket };
}

declare module "busboy" {
  import type { Readable, Writable } from "node:stream";

  interface BusboyFileInfo {
    filename: string;
    encoding: string;
    mimeType: string;
  }

  interface BusboyConfig {
    headers: Record<string, string | string[] | undefined>;
    limits?: {
      fileSize?: number;
      files?: number;
      [key: string]: number | undefined;
    };
  }

  class Busboy extends Writable {
    on(event: "field", listener: (name: string, value: string) => void): this;
    on(
      event: "file",
      listener: (fieldname: string, fileStream: Readable, info: BusboyFileInfo) => void,
    ): this;
    on(event: "filesLimit", listener: () => void): this;
    on(event: "partsLimit", listener: () => void): this;
    on(event: "finish", listener: () => void): this;
    on(event: "close", listener: () => void): this;
  }

  function busboy(config: BusboyConfig): Busboy;

  export = busboy;
}
