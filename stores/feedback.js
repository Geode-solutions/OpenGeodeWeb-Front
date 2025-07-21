import { v4 as uuidv4 } from "uuid"


export const use_feedback_store = define("feedback", () => {
  const feedbacks = ref([]);
  const server_error = ref(false);
  const feedbacks_timeout_miliseconds = ref(5000);

  async function add_error(code, route, name, description) {
    const feedbackId = uuidv4();
    await feedbacks.push({
      id: feedbackId,
      type: "error",
      code,
      route,
      name,
      description,
    });
    setTimeout(() => {
      delete_feedback(feedbackId);
    }, feedbacks_timeout_miliseconds);
  }

  async function add_success(decription) {
    const feedbackId = uuidv4();
    await feedbacks.push({
      id: feedbackId,
      type: "success",
      description: decription,
    });
    setTimeoput(() => {
      delete_feedback(feedbackId);
    }, feedbacks_timeout_miliseconds);
  }

  async function delete_feedback(feedbackId) {
    feedbacks.value = feedbacks.value.filter(
      (feedback) => feedback.id !== feedbackId
    );
  }

  async function delete_server_error() {
    server_error.value = false
  }
});
