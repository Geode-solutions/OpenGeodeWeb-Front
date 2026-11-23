// Third party imports
import { type H3Event, getQuery, readRawBody } from "h3";
import { beforeEach, describe, expect, test } from "vitest";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

// Local imports
import { CHUNK_SIZE_BYTES } from "@ogw_shared/utils/file.js";
import { setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const ZERO = 0;
const ONE = 1;
const TWO = 2;
const SECOND_CHUNK_EXTRA_BYTES = 1000;
const schema = schemas.opengeodeweb_back.upload_file;

function assertIsTestResponse(value: unknown): asserts value is { test: string } {
  const is_test_response =
    typeof value === "object" &&
    value !== null &&
    "test" in value &&
    typeof value.test === "string";
  if (!is_test_response) {
    throw new Error("Response does not have the expected shape");
  }
}

function queryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

// The body can be a Blob of another realm (Node's or the test window's): `instanceof Blob` fails on it, so it
// Is recognized by what the test uses
function isBlob(value: unknown): value is Blob {
  return (
    typeof value === "object" &&
    value !== null &&
    "size" in value &&
    typeof value.size === "number" &&
    "text" in value &&
    typeof value.text === "function"
  );
}

function describeBody(body: unknown): string {
  if (typeof body !== "object" || body === null) {
    return typeof body;
  }
  return Object.prototype.toString.call(body);
}

// The mock request keeps the body as fetch got it: a Blob, which H3's readRawBody() can't convert (it only
// Handles Buffer, stream, FormData and plain object shapes), else one of these
async function mockRequestBodyText(event: H3Event): Promise<string> {
  const request: unknown = event.node.req;
  const body: unknown =
    typeof request === "object" && request !== null && "body" in request ? request.body : undefined;
  if (isBlob(body)) {
    const text = await body.text();
    return text;
  }
  const rawBody = await readRawBody(event, "utf8");
  if (rawBody === undefined) {
    throw new Error(`Mock request body could not be read (${describeBody(body)})`);
  }
  return rawBody;
}

describe("upload_file", () => {
  beforeEach(() => {
    setupActivePinia();
    const backStore = useBackStore();
    (backStore as { base_url: string }).base_url = "";
  });

  test("throw error", async () => {
    const backStore = useBackStore();
    const file = "toto";

    // Upload requires a real File; this intentionally passes an invalid runtime value to exercise its instanceof File guard, declared with @ts-expect-error instead of an unsafe type assertion.
    // @ts-expect-error intentionally invalid runtime type to test the File guard
    await expect(backStore.upload(file)).rejects.toThrow("file must be an instance of File");
  });

  test("onResponse", async () => {
    const feedbackStore = useFeedbackStore();
    const backStore = useBackStore();
    registerEndpoint(schema.$id, {
      method: "PUT",
      handler: () => ({ test: "ok" }),
    });
    const file = new File(["fake_file"], "fake_file.txt");
    let response_value = "";
    await backStore.upload(file, {
      response_function: (response: unknown) => {
        assertIsTestResponse(response);
        response_value = response.test;
      },
    });
    expect(feedbackStore.feedbacks).toHaveLength(ZERO);
    expect(response_value).toBe("ok");
  });

  test("small file uploads as a single raw-body chunk with filename in the query string", async () => {
    const feedbackStore = useFeedbackStore();
    const backStore = useBackStore();
    const receivedChunks: { index: string | undefined; total: string | undefined; body: string }[] =
      [];
    let receivedFilename: string | undefined = undefined;
    registerEndpoint(schema.$id, {
      method: "PUT",
      handler: async (event: H3Event) => {
        const query = getQuery(event);
        receivedFilename = queryString(query.filename);
        receivedChunks.push({
          index: queryString(query.chunk_index),
          total: queryString(query.total_chunks),
          body: await mockRequestBodyText(event),
        });
        return { test: "ok" };
      },
    });
    const file = new File(["fake_file_content"], "fake_file.txt", { type: "text/plain" });

    await backStore.upload(file);

    expect(feedbackStore.feedbacks).toHaveLength(ZERO);
    expect(receivedFilename).toBe("fake_file.txt");
    expect(receivedChunks).toStrictEqual([{ index: "0", total: "1", body: "fake_file_content" }]);
  });

  test("large file uploads sequentially as multiple chunks", async () => {
    const feedbackStore = useFeedbackStore();
    const backStore = useBackStore();
    const receivedChunks: { index: string | undefined; total: string | undefined; body: string }[] =
      [];
    registerEndpoint(schema.$id, {
      method: "PUT",
      handler: async (event: H3Event) => {
        const query = getQuery(event);
        receivedChunks.push({
          index: queryString(query.chunk_index),
          total: queryString(query.total_chunks),
          body: await mockRequestBodyText(event),
        });
        return { test: "ok" };
      },
    });
    const firstChunkContent = "a".repeat(CHUNK_SIZE_BYTES);
    const secondChunkContent = "b".repeat(SECOND_CHUNK_EXTRA_BYTES);
    const file = new File([firstChunkContent, secondChunkContent], "big_file.bin");

    await backStore.upload(file);

    expect(feedbackStore.feedbacks).toHaveLength(ZERO);
    expect(receivedChunks).toHaveLength(TWO);
    expect(receivedChunks[0]).toStrictEqual({ index: "0", total: "2", body: firstChunkContent });
    expect(receivedChunks[ONE]).toStrictEqual({ index: "1", total: "2", body: secondChunkContent });
  });
});
