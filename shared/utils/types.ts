// Covers both flavors of schema used across this codebase: HTTP ("front") schemas carry a `methods` array, websocket RPC ("viewer"/"back") schemas carry `rpc` instead. Neither field is required here since call sites that need one specifically (e.g. fetchSchema needing `methods`) narrow it themselves.
interface JsonRpcSchema {
  readonly $id: string;
  readonly methods?: readonly string[];
  readonly rpc?: string;
  readonly max_retry?: number;
  readonly [key: string]: unknown;
}

interface ValidationError {
  code: number;
  name: string;
  error: string | null | undefined;
}

// Generated `*_schemas.d.ts` files tag each schema with phantom `__params`/`__response` types; untagged schemas fall back to untyped.
type ResponseOf<Schema> = Schema extends { readonly __response?: infer Response }
  ? Response
  : unknown;
type ParamsOf<Schema> = Schema extends { readonly __params?: infer Params }
  ? Params
  : Record<string, unknown>;

// Any microservice's `microservice_version` schema, whatever the package that generated it.
type MicroserviceVersionSchema = JsonRpcSchema & {
  readonly __response?: { microservice_version: string };
};

interface RequestHandlers<Response = unknown> {
  readonly request_error_function?: (error: unknown) => void | Promise<void>;
  // Return value is intentionally untyped: callers commonly return the Promise of a downstream call (e.g. a Dexie `.put()`, which resolves to a primary key) that this code chains/awaits but never inspects the resolved value of.
  readonly response_function?: (response: Response) => unknown;
  readonly response_error_function?: (response: unknown) => void | Promise<void>;
}

interface RequestHandlersWithValidation extends RequestHandlers {
  readonly validation_error_function?: (error: ValidationError) => void;
}

export type {
  JsonRpcSchema,
  MicroserviceVersionSchema,
  ParamsOf,
  RequestHandlers,
  RequestHandlersWithValidation,
  ResponseOf,
  ValidationError,
};
