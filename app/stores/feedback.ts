import type { Description, Label } from "@ogw_front/types/ui";
import type { Route, StatusCode } from "@ogw_front/types/server";
import { v4 as uuidv4 } from "uuid";

const MILLISECONDS_IN_SECOND = 1000;
const DEFAULT_FEEDBACKS_TIMEOUT_SECONDS = 10;
const DEFAULT_ERROR_NAME = "Error";
const DEFAULT_ERROR_DESCRIPTION = "An unexpected error occurred";

// A feedback shown to the user, by the uuid it is pushed with
type FeedbackId = string;

// The name of the error a feedback reports, such as "Error" or the exception name
type ErrorName = string;

type FeedbackType = "error" | "success" | "warning";

interface FeedbackAction {
  label: Label;
  onClick: () => void;
}

interface Feedback {
  id: FeedbackId;
  type: FeedbackType;
  code?: StatusCode;
  route?: Route;
  name?: ErrorName;
  description?: Description;
  action?: FeedbackAction;
}

export const useFeedbackStore = defineStore("feedback", () => {
  const feedbacks = ref<Feedback[]>([]);
  const server_error = ref(false);
  const feedbacks_timeout_miliseconds = ref(
    DEFAULT_FEEDBACKS_TIMEOUT_SECONDS * MILLISECONDS_IN_SECOND,
  );

  function delete_feedback(feedbackId: FeedbackId): void {
    feedbacks.value = feedbacks.value.filter((feedback) => feedback.id !== feedbackId);
  }

  function push_feedback(feedback: Omit<Feedback, "id">): void {
    const feedbackId = uuidv4();
    feedbacks.value.push({ id: feedbackId, ...feedback });
    setTimeout(() => {
      delete_feedback(feedbackId);
    }, feedbacks_timeout_miliseconds.value);
  }

  function add_error(
    code: StatusCode,
    route: Route,
    name: ErrorName,
    description: Description,
  ): void {
    push_feedback({
      type: "error",
      code,
      route,
      name: name === "" ? DEFAULT_ERROR_NAME : name,
      // The snackbar only shows the description: never leave it empty
      description: [description, name].find((text) => text !== "") ?? DEFAULT_ERROR_DESCRIPTION,
    });
  }

  function add_success(description: Description, action?: FeedbackAction): void {
    push_feedback({ type: "success", description, ...(action !== undefined && { action }) });
  }

  function add_warning(description: Description, action?: FeedbackAction): void {
    push_feedback({ type: "warning", description, ...(action !== undefined && { action }) });
  }

  function set_server_error(value: boolean): void {
    server_error.value = value;
  }

  function delete_server_error(): void {
    set_server_error(false);
  }

  return {
    feedbacks,
    server_error,
    feedbacks_timeout_miliseconds,
    add_error,
    add_success,
    add_warning,
    delete_feedback,
    set_server_error,
    delete_server_error,
  };
});

export type { FeedbackAction, ErrorName, FeedbackId };
