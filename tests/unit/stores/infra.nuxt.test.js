// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { registerEndpoint } from "@nuxt/test-utils/runtime";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_front/utils/local/app_mode";
import { setupActivePinia } from "@ogw_tests/utils";
import { useCloudStore } from "@ogw_front/stores/cloud";
import { useGeodeStore } from "@ogw_front/stores/geode";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Mock navigator.locks API
const mockLockRequest = vi
  .fn()
  .mockImplementation(async (name, handler) => await handler({ name }));

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
});

beforeEach(() => {
  setupActivePinia();
});

describe("Infra Store", () => {
  describe("state", () => {
    test("initial state", () => {
      const infraStore = useInfraStore();
      expectTypeOf(infraStore.domain_name).toBeString();
      expectTypeOf(infraStore.status).toBeString();
    });
  });
  describe("getters", () => {
    describe("app_mode", () => {
      test("test type", () => {
        const infraStore = useInfraStore();
        expectTypeOf(infraStore.app_mode).toBeString();
      });
    });

    describe("domain_name", () => {
      test("test app_mode BROWSER", () => {
        const infraStore = useInfraStore();
        infraStore.app_mode = appMode.BROWSER;
        expect(infraStore.domain_name).toBe("localhost");
      });
      test("test app_mode DESKTOP", () => {
        const infraStore = useInfraStore();
        infraStore.app_mode = appMode.DESKTOP;
        expect(infraStore.domain_name).toBe("localhost");
      });
      test("test app_mode CLOUD", () => {
        const infraStore = useInfraStore();
        infraStore.app_mode = appMode.CLOUD;
        expect(infraStore.domain_name).toBe("localhost");
      });
    });

    describe("microservices_connected", () => {
      test("test no microservices registered", () => {
        const infraStore = useInfraStore();
        expect(infraStore.microservices_connected).toBe(true);
      });
      test("test geode false & viewer false", () => {
        const infraStore = useInfraStore();
        const geodeStore = useGeodeStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });

        geodeStore.$patch({ status: Status.NOT_CONNECTED });
        viewerStore.$patch({ status: Status.NOT_CONNECTED });
        expect(infraStore.microservices_connected).toBe(false);
      });
      test("test geode true & viewer false", () => {
        const infraStore = useInfraStore();
        const geodeStore = useGeodeStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });

        geodeStore.$patch({ status: Status.CONNECTED });
        viewerStore.$patch({ status: Status.NOT_CONNECTED });
        expect(infraStore.microservices_connected).toBe(false);
      });
      test("test geode false & viewer true", () => {
        const infraStore = useInfraStore();
        const geodeStore = useGeodeStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });

        geodeStore.$patch({ status: Status.NOT_CONNECTED });
        viewerStore.$patch({ status: Status.CONNECTED });
        expect(infraStore.microservices_connected).toBe(false);
      });
      test("test geode true & viewer true", () => {
        const infraStore = useInfraStore();
        const geodeStore = useGeodeStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });

        geodeStore.$patch({ status: Status.CONNECTED });
        viewerStore.$patch({ status: Status.CONNECTED });
        expect(infraStore.microservices_connected).toBe(true);
      });
    });

    describe("microservices_busy", () => {
      test("test no microservices registered", () => {
        const infraStore = useInfraStore();
        expect(infraStore.microservices_busy).toBe(false);
      });
      test("test geode false & viewer false", () => {
        const infraStore = useInfraStore();
        const geodeStore = useGeodeStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });

        geodeStore.$patch({ request_counter: 0 });
        viewerStore.$patch({ request_counter: 0 });
        expect(infraStore.microservices_busy).toBe(false);
      });
      test("test geode true & viewer false", () => {
        const infraStore = useInfraStore();
        const geodeStore = useGeodeStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });

        geodeStore.$patch({ request_counter: 1 });
        viewerStore.$patch({ request_counter: 0 });
        expect(infraStore.microservices_busy).toBe(true);
      });
      test("test geode false & viewer true", () => {
        const infraStore = useInfraStore();
        const geodeStore = useGeodeStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });

        geodeStore.$patch({ request_counter: 0 });
        viewerStore.$patch({ request_counter: 1 });
        expect(infraStore.microservices_busy).toBe(true);
      });
      test("test geode true & viewer true", () => {
        const infraStore = useInfraStore();
        const geodeStore = useGeodeStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });

        geodeStore.$patch({ request_counter: 1 });
        viewerStore.$patch({ request_counter: 1 });
        expect(infraStore.microservices_busy).toBe(true);
      });
    });
  });

  describe("actions", () => {
    describe("register_microservice", () => {
      test("register geode microservice", () => {
        const infraStore = useInfraStore();
        const geodeStore = useGeodeStore();

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });

        expect(infraStore.microservices.length).toBe(1);
        expect(infraStore.microservices[0].$id).toBe("geode");
      });

      test("register multiple microservices", () => {
        const infraStore = useInfraStore();
        const geodeStore = useGeodeStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });

        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        });

        expect(infraStore.microservices.length).toBe(2);
      });
    });
  });

  describe("create_backend", () => {
    // Test without microservices
    test("test with end-point", () => {
      const infraStore = useInfraStore();
      const geodeStore = useGeodeStore();
      const viewerStore = useViewerStore();

      infraStore.app_mode = appMode.CLOUD;
      const url = "test.com";
      registerEndpoint("/api/app/run_cloud", {
        method: "POST",
        handler: () => ({ url }),
      });
      infraStore.create_backend("", "", false);
      expect(infraStore.status).toBe(Status.CREATED);
      expect(infraStore.domain_name).toBe(url);

      expect(geodeStore.status).toBe(Status.NOT_CONNECTED);
      expect(viewerStore.status).toBe(Status.NOT_CONNECTED);
    });
  });
});
