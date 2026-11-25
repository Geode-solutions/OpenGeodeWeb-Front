// Third party imports
import { beforeEach, describe, expect, test } from "vitest";
import { TimeoutError } from "p-timeout";

// Local imports
import { reportError, toErrorFeedback } from "@ogw_internal/utils/error_feedback";
import { setupActivePinia } from "@ogw_tests/utils";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const BAD_REQUEST = 400;
const WSLINK_EXCEPTION = -32_603;
const UNKNOWN_CODE = 0;
const description = "No BRep object found in model.og_brep";

describe("toErrorFeedback()", () => {
  test("ofetch response with an ErrorResponse body", () => {
    const response = {
      status: BAD_REQUEST,
      statusText: "BAD REQUEST",
      _data: { code: BAD_REQUEST, name: "Bad Request", description },
    };
    expect(toErrorFeedback(response)).toStrictEqual({
      code: BAD_REQUEST,
      name: "Bad Request",
      description,
    });
  });

  test("ofetch response without a body", () => {
    expect(toErrorFeedback({ status: BAD_REQUEST, statusText: "BAD REQUEST" })).toStrictEqual({
      code: BAD_REQUEST,
      name: "BAD REQUEST",
      description: "An unexpected error occurred",
    });
  });

  test("wslink exception", () => {
    const error = {
      code: WSLINK_EXCEPTION,
      message: "Exception raised",
      data: {
        method: "opengeodeweb_viewer.model.register",
        exception: `ValueError('${description}')`,
        trace: "Traceback (most recent call last): ...",
      },
    };
    expect(toErrorFeedback(error)).toStrictEqual({
      code: WSLINK_EXCEPTION,
      name: "ValueError",
      description,
    });
  });

  test("wslink error without exception", () => {
    const error = { code: WSLINK_EXCEPTION, message: "Unregistered method called" };
    expect(toErrorFeedback(error)).toStrictEqual({
      code: WSLINK_EXCEPTION,
      name: "Error",
      description: "Unregistered method called",
    });
  });

  test("thrown Error", () => {
    expect(toErrorFeedback(new TimeoutError("/test: Timed out after 10ms"))).toStrictEqual({
      code: UNKNOWN_CODE,
      name: "TimeoutError",
      description: "/test: Timed out after 10ms",
    });
  });

  test("unknown value", () => {
    expect(toErrorFeedback(undefined)).toStrictEqual({
      code: UNKNOWN_CODE,
      name: "Error",
      description: "An unexpected error occurred",
    });
  });
});

describe("reportError()", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("adds one error feedback", () => {
    const feedbackStore = useFeedbackStore();
    reportError("/test", { status: BAD_REQUEST, _data: { name: "Bad Request", description } });
    expect(feedbackStore.feedbacks).toHaveLength(1);
    expect(feedbackStore.feedbacks[0]).toMatchObject({
      type: "error",
      code: BAD_REQUEST,
      route: "/test",
      name: "Bad Request",
      description,
    });
  });
});
