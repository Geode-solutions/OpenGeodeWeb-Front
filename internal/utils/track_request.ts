import {
  type ConsoleEntryKind,
  type ConsoleOutcome,
  useConsoleStore,
} from "@ogw_front/stores/console";
import { TimeoutError } from "p-timeout";
import { toErrorFeedback } from "./error_feedback.js";

interface TrackedRequest {
  source: string;
  kind: ConsoleEntryKind;
  route: string;
  label?: string;
  params?: unknown;
  // False for the requests repeated in the background (pings): only their failures are logged
  log_success?: boolean;
}

const GENERIC_ERROR_NAME = "Error";

// An ofetch FetchError keeps the microservice ErrorResponse in its response: read it as the snackbar does
function failedResponse(error: unknown): unknown {
  if (typeof error === "object" && error !== null && "response" in error) {
    const { response } = error;
    if (typeof response === "object" && response !== null) {
      return response;
    }
  }
  return error;
}

function failureOf(error: unknown): ConsoleOutcome {
  const { name, description } = toErrorFeedback(failedResponse(error));
  const message =
    name === GENERIC_ERROR_NAME || description === name ? description : `${name}: ${description}`;
  return { status: error instanceof TimeoutError ? "timeout" : "error", error: message };
}

type FollowRequest = <Result>(pending: Promise<Result>) => Promise<Result>;

// Opens the console entry of a microservice request: call it before sending, then follow the request until it settles
function trackRequest({ log_success = true, ...request }: TrackedRequest): FollowRequest {
  const consoleStore = useConsoleStore();
  const started_at = Date.now();
  let entryId: number | undefined = undefined;
  if (log_success) {
    entryId = consoleStore.start_request(request);
  }

  return async <Result>(pending: Promise<Result>): Promise<Result> => {
    try {
      const result = await pending;
      if (entryId !== undefined) {
        consoleStore.finish_request(entryId, { status: "success" });
      }
      return result;
    } catch (error) {
      const outcome = failureOf(error);
      if (entryId === undefined) {
        consoleStore.log({
          ...request,
          ...outcome,
          started_at,
          duration_ms: Date.now() - started_at,
        });
      } else {
        consoleStore.finish_request(entryId, outcome);
      }
      throw error;
    }
  };
}

export { trackRequest };
