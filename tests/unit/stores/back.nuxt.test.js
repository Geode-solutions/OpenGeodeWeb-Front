// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { registerEndpoint } from "@nuxt/test-utils/runtime";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_front/utils/local/app_mode";
import { setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useInfraStore } from "@ogw_front/stores/infra";

// CONSTANTS
const PORT_443 = "443";
const PORT_12 = "12";
const PORT_5000 = "5000";
const STATUS_500 = 500;
const EXPECTED_ONE_REQUEST = 1;
const EXPECTED_NO_REQUEST = 0;

describe("back store", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("state", () => {
    const backStore = useBackStore();
    expectTypeOf(backStore.default_local_port).toBeString();
    expectTypeOf(backStore.request_counter).toBeNumber();
    expectTypeOf(backStore.status).toBeString();
  });

  describe("protocol", () => {
    test("app_mode CLOUD", () => {
      const infraStore = useInfraStore();
      const backStore = useBackStore();
      infraStore.app_mode = appMode.CLOUD;
      expect(backStore.protocol).toBe("https");
    });

    test("app_mode BROWSER/DESKTOP", () => {
      const infraStore = useInfraStore();
      const backStore = useBackStore();
      infraStore.app_mode = appMode.BROWSER;
      expect(backStore.protocol).toBe("http");
      infraStore.app_mode = appMode.DESKTOP;
      expect(backStore.protocol).toBe("http");
    });
  });

  describe("port", () => {
    test("app_mode CLOUD", () => {
      const infraStore = useInfraStore();
      const backStore = useBackStore();
      infraStore.app_mode = appMode.CLOUD;
      expect(backStore.port).toBe(PORT_443);
    });

    test("app_mode BROWSER/DESKTOP", () => {
      const infraStore = useInfraStore();
      const backStore = useBackStore();
      infraStore.app_mode = appMode.BROWSER;
      expect(backStore.port).toBe(backStore.default_local_port);
      infraStore.app_mode = appMode.DESKTOP;
      expect(backStore.port).toBe(backStore.default_local_port);
    });

    test("override default_local_port", () => {
      const infraStore = useInfraStore();
      const backStore = useBackStore();
      infraStore.app_mode = appMode.DESKTOP;
      backStore.default_local_port = PORT_12;
      expect(backStore.port).toBe(PORT_12);
    });
  });

  describe("base_url", () => {
    test("app_mode BROWSER", () => {
      const infraStore = useInfraStore();
      const backStore = useBackStore();
      infraStore.app_mode = appMode.BROWSER;
      infraStore.domain_name = "localhost";
      expect(backStore.base_url).toBe(`http://localhost:${PORT_5000}`);
    });

    test("app_mode CLOUD", () => {
      const infraStore = useInfraStore();
      const backStore = useBackStore();
      infraStore.app_mode = appMode.CLOUD;
      infraStore.domain_name = "example.com";
      expect(backStore.base_url).toBe(`https://example.com:${PORT_443}/geode`);
    });
  });

  describe("is_busy", () => {
    test("is_busy", () => {
      const backStore = useBackStore();
      backStore.request_counter = EXPECTED_ONE_REQUEST;
      expect(backStore.is_busy).toBe(true);
    });

    test("not is_busy", () => {
      const backStore = useBackStore();
      backStore.request_counter = EXPECTED_NO_REQUEST;
      expect(backStore.is_busy).toBe(false);
    });
  });
});

describe("geode store actions", () => {
  const getFakeCall = vi.fn();

  beforeEach(() => {
    registerEndpoint(back_schemas.opengeodeweb_back.ping.$id, getFakeCall);
  });

  describe("ping", () => {
    test("response", async () => {
      const backStore = useBackStore();
      backStore.base_url = "";
      getFakeCall.mockReturnValue({});
      await backStore.ping();
      expect(backStore.status).toBe(Status.CONNECTED);
    });

    test("response_error", async () => {
      const backStore = useBackStore();
      backStore.base_url = "";
      getFakeCall.mockImplementation(() => {
        throw createError({ status: STATUS_500 });
      });
      await expect(backStore.ping()).rejects.toThrow("500");
      expect(backStore.status).toBe(Status.NOT_CONNECTED);
    });
  });

  describe("request counter", () => {
    test("increment/decrement", async () => {
      const backStore = useBackStore();
      expect(backStore.request_counter).toBe(EXPECTED_NO_REQUEST);
      await backStore.start_request();
      expect(backStore.request_counter).toBe(EXPECTED_ONE_REQUEST);
      await backStore.stop_request();
      expect(backStore.request_counter).toBe(EXPECTED_NO_REQUEST);
    });
  });
});
