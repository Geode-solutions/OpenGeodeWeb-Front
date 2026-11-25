// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { setResponseStatus } from "h3";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { trackRequest } from "@ogw_internal/utils/track_request";
import { useActivityStore } from "@ogw_front/stores/activity";
import { useBackStore } from "@ogw_front/stores/back";

vi.setConfig({ testTimeout: 10_000 });

const FIRST_INDEX = 0;
const STATUS_500 = 500;

const request = { source: "back", kind: "http", route: "opengeodeweb_back/test" } as const;
const background = { ...request, log_success: false } as const;

describe("trackRequest()", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("the entry runs until the request settles", async () => {
    const activityStore = useActivityStore();
    const followRequest = trackRequest(request);
    expect(activityStore.running).toHaveLength(1);
    await followRequest(Promise.resolve({}));
    expect(activityStore.running).toHaveLength(0);
    expect(activityStore.entries[FIRST_INDEX]?.status).toBe("success");
  });

  test("a failed request keeps its error message", async () => {
    const activityStore = useActivityStore();
    const followRequest = trackRequest(request);
    const failure = Promise.reject(new Error("Boom"));
    await expect(followRequest(failure)).rejects.toThrow("Boom");
    expect(activityStore.entries[FIRST_INDEX]).toMatchObject({ status: "error", error: "Boom" });
  });

  test("a failed HTTP request shows the microservice error", async () => {
    const activityStore = useActivityStore();
    const followRequest = trackRequest(request);
    const fetchError = Object.assign(new Error("[POST] /save_viewable_file: 500"), {
      response: {
        status: STATUS_500,
        _data: { name: "Internal Server Error", description: "Cannot load BRep from file" },
      },
    });
    await expect(followRequest(Promise.reject(fetchError))).rejects.toBe(fetchError);
    expect(activityStore.entries[FIRST_INDEX]?.error).toBe(
      "Internal Server Error: Cannot load BRep from file",
    );
  });

  test("a background request is not logged when it succeeds", async () => {
    const activityStore = useActivityStore();
    const followPing = trackRequest(background);
    expect(activityStore.running).toHaveLength(0);
    await followPing(Promise.resolve({}));
    expect(activityStore.entries).toHaveLength(0);
  });

  test("a background request is logged when it fails", async () => {
    const activityStore = useActivityStore();
    const followPing = trackRequest(background);
    const failure = Promise.reject(new Error("Down"));
    await expect(followPing(failure)).rejects.toThrow("Down");
    expect(activityStore.entries).toHaveLength(1);
    expect(activityStore.entries[FIRST_INDEX]).toMatchObject({ status: "error", error: "Down" });
  });

  test("a route named like a ping is logged unless the caller says so", async () => {
    const activityStore = useActivityStore();
    const followRequest = trackRequest({ ...request, route: "extension_back/ping" });
    await followRequest(Promise.resolve({}));
    expect(activityStore.entries).toHaveLength(1);
  });
});

describe("microservice requests in the activity panel", () => {
  beforeEach(() => {
    setupActivePinia();
    const backStore = useBackStore();
    (backStore as { base_url: string }).base_url = "";
  });

  test("a back request is logged with its route and params", async () => {
    const schema = back_schemas.opengeodeweb_back.allowed_files;
    registerEndpoint(schema.$id, { method: "POST", handler: () => ({ extensions: [] }) });
    const backStore = useBackStore();
    const activityStore = useActivityStore();
    await backStore.request({ schema, params: {} });
    expect(activityStore.entries[FIRST_INDEX]).toMatchObject({
      source: "back",
      kind: "http",
      route: schema.$id,
      status: "success",
    });
  });

  test("a failed back request is logged with the back error", async () => {
    const schema = back_schemas.opengeodeweb_back.allowed_files;
    registerEndpoint(schema.$id, {
      method: "POST",
      handler: (event) => {
        setResponseStatus(event, STATUS_500);
        return { code: STATUS_500, name: "Internal Server Error", description: "Broken" };
      },
    });
    const backStore = useBackStore();
    const activityStore = useActivityStore();
    await expect(backStore.request({ schema, params: {} })).rejects.toThrow(String(STATUS_500));
    expect(activityStore.entries[FIRST_INDEX]).toMatchObject({
      status: "error",
      error: "Internal Server Error: Broken",
    });
  });

  test("the back ping is not logged", async () => {
    registerEndpoint(back_schemas.opengeodeweb_back.ping.$id, {
      method: "POST",
      handler: () => ({}),
    });
    const backStore = useBackStore();
    const activityStore = useActivityStore();
    await backStore.ping();
    expect(activityStore.entries).toHaveLength(0);
  });

  test("an upload is logged with its file name", async () => {
    const schema = back_schemas.opengeodeweb_back.upload_file;
    registerEndpoint(schema.$id, { method: "PUT", handler: () => ({}) });
    const backStore = useBackStore();
    const activityStore = useActivityStore();
    await backStore.upload(new File(["content"], "model.og_brep"));
    expect(activityStore.entries[FIRST_INDEX]).toMatchObject({
      kind: "upload",
      route: schema.$id,
      label: "model.og_brep",
      status: "success",
    });
  });
});
