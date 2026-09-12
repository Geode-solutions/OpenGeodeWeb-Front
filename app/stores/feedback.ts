import { v4 as uuidv4 } from "uuid";

const MILLISECONDS_IN_SECOND = 1000;
const DEFAULT_FEEDBACKS_TIMEOUT_SECONDS = 10;

type FeedbackType = "error" | "success" | "warning";

interface Feedback {
  id: string;
  type: FeedbackType;
  code?: number;
  route?: string;
  name?: string;
  description?: string;
}

export const useFeedbackStore = defineStore("feedback", {
  state: () => ({
    feedbacks: [] as Feedback[],
    server_error: false,
    feedbacks_timeout_miliseconds: DEFAULT_FEEDBACKS_TIMEOUT_SECONDS * MILLISECONDS_IN_SECOND,
  }),
  actions: {
    async add_error(code: number, route: string, name: string, description: string) {
      const feedbackId = uuidv4();
      await this.feedbacks.push({
        id: feedbackId,
        type: "error",
        code,
        route,
        name,
        description,
      });
      setTimeout(() => {
        this.delete_feedback(feedbackId);
      }, this.feedbacks_timeout_miliseconds);
    },
    async add_success(description: string) {
      const feedbackId = uuidv4();
      await this.feedbacks.push({
        id: feedbackId,
        type: "success",
        description,
      });
      setTimeout(() => {
        this.delete_feedback(feedbackId);
      }, this.feedbacks_timeout_miliseconds);
    },
    async add_warning(description: string) {
      const feedbackId = uuidv4();
      await this.feedbacks.push({
        id: feedbackId,
        type: "warning",
        description,
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
