// Minimal ambient typings for third-party packages used under server/ that ship no types of their own and have no @types/* package installed. Only the members this codebase actually uses are declared.
// This file declares ambient types for two separate untyped packages (`ws` and `busboy`); splitting it in two would just be file-count churn for a couple of small, always-imported-together vendor shims. Its short identifiers (`on`, `id`, ...) mirror the real, external APIs they type - renaming them here wouldn't change the names real callers already use.
// Deliberately does not import from "node:buffer" / "node:stream": @types/node is not resolvable in this project's tsconfig, so any reference to a node builtin module - even via `import type` - fails the same way `Buffer`/`Readable`/`Writable` did as bare globals. Instead this file declares the minimal local shapes it actually needs.
// oxlint-disable eslint/max-classes-per-file, eslint/id-length

declare module "ws" {
  type RawData = string | Uint8Array | ArrayBuffer | readonly Uint8Array[];

  class WebSocket {
    public static readonly CONNECTING: number;
    public static readonly OPEN: number;
    public static readonly CLOSING: number;
    public static readonly CLOSED: number;

    public constructor(address: string);

    public readyState: number;

    public on(event: "open", listener: () => void): this;
    public on(event: "message", listener: (data: RawData) => void): this;
    public on(event: "close", listener: (code?: number, reason?: Uint8Array) => void): this;
    public on(event: "error", listener: (error: Readonly<Error>) => void): this;
    public once(event: string, listener: (...args: readonly unknown[]) => void): this;

    public send(data: string): void;
    public close(): void;
  }

  export { WebSocket };
}

declare module "busboy" {
  interface MinimalReadable {
    on(event: string, listener: (...args: readonly unknown[]) => void): this;
    pipe<T>(destination: T): T;
  }

  interface MinimalWritable {
    on(event: string, listener: (...args: readonly unknown[]) => void): this;
  }

  interface BusboyFileInfo {
    readonly filename: string;
    readonly encoding: string;
    readonly mimeType: string;
  }

  interface BusboyConfig {
    readonly headers: Readonly<Record<string, string | string[] | undefined>>;
    readonly limits?: Readonly<{
      fileSize?: number;
      files?: number;
      [key: string]: number | undefined;
    }>;
  }

  class Busboy extends MinimalWritable {
    public on(event: "field", listener: (name: string, value: string) => void): this;
    public on(
      event: "file",
      listener: (
        fieldname: string,
        fileStream: MinimalReadable,
        info: Readonly<BusboyFileInfo>,
      ) => void,
    ): this;
    public on(event: "filesLimit" | "partsLimit" | "finish" | "close", listener: () => void): this;
  }

  function busboy(config: Readonly<BusboyConfig>): Busboy;

  export = busboy;
}
