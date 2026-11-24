import { v4 as uuidv4 } from "uuid";

const MILLISECONDS_IN_SECOND = 1000;
const DEFAULT_FEEDBACKS_TIMEOUT_SECONDS = 10;
const DEFAULT_ERROR_NAME = "Error";
const DEFAULT_ERROR_DESCRIPTION = "An unexpected error occurred";

type FeedbackType = "error" | "success" | "warning";

interface FeedbackAction {
  label: string;
  onClick: () => void;
}

interface Feedback {
  id: string;
  type: FeedbackType;
  code?: number;
  route?: string;
  name?: string;
  description?: string;
  action?: FeedbackAction;
}

export const useFeedbackStore = defineStore("feedback", {
  state: () => ({
    feedbacks: [] as Feedback[],
    server_error: false,
    feedbacks_timeout_miliseconds: DEFAULT_FEEDBACKS_TIMEOUT_SECONDS * MILLISECONDS_IN_SECOND,
  }),
  actions: {
    add_error(code: number, route: string, name: string, description: string) {
      const feedbackId = uuidv4();
      this.feedbacks.push({
        id: feedbackId,
        type: "error",
        code,
        route,
        name: name === "" ? DEFAULT_ERROR_NAME : name,
        // The snackbar only shows the description: never leave it empty
        description: [description, name].find((text) => text !== "") ?? DEFAULT_ERROR_DESCRIPTION,
      });
      setTimeout(() => {
        this.delete_feedback(feedbackId);
      }, this.feedbacks_timeout_miliseconds);
    },
    add_success(description: string, action?: FeedbackAction) {
      const feedbackId = uuidv4();
      this.feedbacks.push({
        id: feedbackId,
        type: "success",
        description,
        ...(action !== undefined && { action }),
      });
      setTimeout(() => {
        this.delete_feedback(feedbackId);
      }, this.feedbacks_timeout_miliseconds);
    },
    add_warning(description: string, action?: FeedbackAction) {
      const feedbackId = uuidv4();
      this.feedbacks.push({
        id: feedbackId,
        type: "warning",
        description,
        ...(action !== undefined && { action }),
      });
      setTimeout(() => {
        this.delete_feedback(feedbackId);
      }, this.feedbacks_timeout_miliseconds);
    },
    delete_feedback(feedbackId: string) {
      this.feedbacks = this.feedbacks.filter((feedback) => feedback.id !== feedbackId);
    },
    delete_server_error() {
      this.server_error = false;
    },
  },
});

export type { FeedbackAction };
