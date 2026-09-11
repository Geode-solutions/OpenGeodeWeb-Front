interface JsonRpcSchema {
  $id: string;
  methods: string[];
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
  response_function?: (response: unknown) => void | Promise<void>;
  response_error_function?: (response: unknown) => void;
}

interface RequestHandlersWithValidation extends RequestHandlers {
  validation_error_function?: (error: ValidationError) => void;
}

export type { JsonRpcSchema, RequestHandlers, RequestHandlersWithValidation, ValidationError };
