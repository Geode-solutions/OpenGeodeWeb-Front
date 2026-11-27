import type { ErrorResponse } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { Route } from "@ogw_front/types/server";
import { TimeoutError } from "p-timeout";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const UNKNOWN_CODE = 0;
const DEFAULT_NAME = "Error";
const DEFAULT_DESCRIPTION = "An unexpected error occurred";

// Wslink sends a Python exception as its repr, e.g. ValueError('No BRep object found')
const PYTHON_REPR = /^(?<name>[A-Za-z_][\w.]*)\((?<args>.*)\)$/su;
const QUOTED_STRING = /^(?<quote>['"])(?<content>.*)\k<quote>$/su;

// A field of an error response, by its name
type FieldName = string;

type Fields = Record<FieldName, unknown>;

function isRecord(value: unknown): value is Fields {
  return typeof value === "object" && value !== null;
}

function stringField(record: Fields, key: FieldName): string | undefined {
  const value = record[key];
  return typeof value === "string" && value !== "" ? value : undefined;
}

function numberField(record: Fields, key: FieldName): number | undefined {
  const value = record[key];
  return typeof value === "number" ? value : undefined;
}

function parsePythonException(repr: string | undefined): Partial<ErrorResponse> {
  if (repr === undefined) {
    return {};
  }
  const match = PYTHON_REPR.exec(repr.trim());
  if (!match?.groups) {
    return { description: repr };
  }
  const { name } = match.groups;
  const args = match.groups.args?.trim() ?? "";
  const quoted = QUOTED_STRING.exec(args);
  return { name, description: quoted?.groups?.content ?? (args === "" ? undefined : args) };
}

/*
 * Turn whatever a microservice call failed with into one { code, name, description }:
 * - an ofetch response, whose parsed body (`_data`) is an ErrorResponse (Flask back, Nuxt server routes)
 * - an ErrorResponse body itself
 * - a wslink error { code, message, data: { exception, trace } } (viewer)
 * - any thrown Error (network failure, timeout...)
 */
function toErrorFeedback(value: unknown): ErrorResponse {
  if (!isRecord(value)) {
    return {
      code: UNKNOWN_CODE,
      name: DEFAULT_NAME,
      description: typeof value === "string" && value !== "" ? value : DEFAULT_DESCRIPTION,
    };
  }
  // Ofetch puts the parsed response body in `_data`
  let body = value;
  if (isRecord(value._data)) {
    body = value._data;
  }
  let exception: Partial<ErrorResponse> = {};
  if (isRecord(body.data)) {
    exception = parsePythonException(stringField(body.data, "exception"));
  }
  return {
    code:
      numberField(value, "status") ??
      numberField(body, "code") ??
      numberField(value, "statusCode") ??
      UNKNOWN_CODE,
    name:
      stringField(body, "name") ??
      exception.name ??
      stringField(value, "statusText") ??
      stringField(value, "name") ??
      DEFAULT_NAME,
    description:
      stringField(body, "description") ??
      exception.description ??
      stringField(body, "message") ??
      stringField(value, "message") ??
      DEFAULT_DESCRIPTION,
  };
}

// The single entry point to show a microservice error to the user
function reportError(route: Route, value: unknown): void {
  const { code, name, description } = toErrorFeedback(value);
  useFeedbackStore().add_error(code, route, name, description);
}

// A timeout rejects without going through the request handlers: report it as well
async function reportTimeout<Result>(route: Route, request: Promise<Result>): Promise<Result> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof TimeoutError) {
      reportError(route, error);
    }
    throw error;
  }
}

export { reportError, reportTimeout, toErrorFeedback };
