// Third party imports
import { createApp, createError, toWebHandler } from "h3";
import { describe, expect, test } from "vitest";

// Local imports
import {
  defineRawEventHandler,
  defineTypedEventHandler,
} from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import type { TypedSchema } from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

const SUCCESS = 200;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;
const TIMEOUT_MS = 5000;

const typedSchema: JsonRpcSchema & TypedSchema<{ name: string }, { greeting: string }> = {
  $id: "api/test/echo",
  route: "/echo",
  methods: ["POST"],
  type: "object",
  properties: { name: { type: "string" } },
  required: ["name"],
  additionalProperties: false,
  response: {
    type: "object",
    properties: { greeting: { type: "string" } },
    required: ["greeting"],
    additionalProperties: false,
  },
};

async function post(
  handler: ReturnType<typeof defineRawEventHandler>,
  body: unknown,
): Promise<Response> {
  const app = createApp();
  app.use("/echo", handler);
  const response = await toWebHandler(app)(
    new Request("http://localhost/echo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
  return response;
}

describe("typed event handler", () => {
  test(
    "returns the typed response",
    async () => {
      const handler = defineTypedEventHandler(typedSchema, ({ name }) => ({
        greeting: `Hello ${name}`,
      }));
      const response = await post(handler, { name: "Geode" });
      expect(response.status).toBe(SUCCESS);
      await expect(response.json()).resolves.toStrictEqual({ greeting: "Hello Geode" });
    },
    TIMEOUT_MS,
  );

  test(
    "rejects params not matching the schema with an ErrorResponse",
    async () => {
      const handler = defineTypedEventHandler(typedSchema, ({ name }) => ({ greeting: name }));
      const response = await post(handler, { wrong: "key" });
      expect(response.status).toBe(BAD_REQUEST);
      await expect(response.json()).resolves.toMatchObject({
        code: BAD_REQUEST,
        name: "Bad Request",
      });
    },
    TIMEOUT_MS,
  );

  test(
    "sends thrown errors as an ErrorResponse",
    async () => {
      const handler = defineTypedEventHandler(typedSchema, () => {
        throw createError({
          statusCode: NOT_FOUND,
          statusMessage: "Not Found",
          message: "missing",
        });
      });
      const response = await post(handler, { name: "Geode" });
      expect(response.status).toBe(NOT_FOUND);
      await expect(response.json()).resolves.toStrictEqual({
        code: NOT_FOUND,
        name: "Not Found",
        description: "missing",
      });
    },
    TIMEOUT_MS,
  );

  test(
    "fails a response not matching its schema outside production",
    async () => {
      const handler = defineTypedEventHandler(
        typedSchema,
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- deliberately wrong response
        () => ({ wrong: true }) as unknown as { greeting: string },
      );
      const response = await post(handler, { name: "Geode" });
      expect(response.status).toBe(INTERNAL_SERVER_ERROR);
    },
    TIMEOUT_MS,
  );
});

describe("raw event handler", () => {
  test(
    "sends unexpected errors as a 500 ErrorResponse",
    async () => {
      const handler = defineRawEventHandler(typedSchema, () => {
        throw new Error("boom");
      });
      const response = await post(handler, {});
      expect(response.status).toBe(INTERNAL_SERVER_ERROR);
      await expect(response.json()).resolves.toStrictEqual({
        code: INTERNAL_SERVER_ERROR,
        name: "Internal Server Error",
        description: "boom",
      });
    },
    TIMEOUT_MS,
  );
});
