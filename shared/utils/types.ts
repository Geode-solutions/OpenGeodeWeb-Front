// Covers both flavors of schema used across this codebase: HTTP ("front") schemas
// carry a `methods` array, websocket RPC ("viewer"/"back") schemas carry `rpc`
// instead. Neither field is required here since call sites that need one
// specifically (e.g. fetchSchema needing `methods`) narrow it themselves.
interface JsonRpcSchema {
  $id: string;
  methods?: string[];
  rpc?: string;
  max_retry?: number;
  [key: string]: unknown;
}

interface ValidationError {
  code: number;
  name: string;
  error: string | null | undefined;
}

interface RequestHandlers {
  request_error_function?: (error: unknown) => void;
  // Return value is intentionally untyped: callers commonly return the Promise of
  // a downstream call (e.g. a Dexie `.put()`, which resolves to a primary key) that
  // this code chains/awaits but never inspects the resolved value of.
  response_function?: (response: unknown) => unknown;
  response_error_function?: (response: unknown) => void;
}

interface RequestHandlersWithValidation extends RequestHandlers {
  validation_error_function?: (error: ValidationError) => void;
}

export type { JsonRpcSchema, RequestHandlers, RequestHandlersWithValidation, ValidationError };
