// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test } from "vitest";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_shared/app_mode";
import { setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

describe("infra store", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  describe("state", () => {
    test("initial state", () => {
      const infraStore = useInfraStore();
      expectTypeOf(infraStore.domain_name).toBeString();
      expectTypeOf(infraStore.status).toBeString();
    });
  });
  describe("getters", () => {
    describe("app_mode", () => {
      test("type", () => {
        const infraStore = useInfraStore();
        expectTypeOf(infraStore.app_mode).toBeString();
      });
    });

    describe("domain_name", () => {
      test("app_mode BROWSER", () => {
        const infraStore = useInfraStore();
        infraStore.app_mode = appMode.BROWSER;
        expect(infraStore.domain_name).toBe("localhost");
      });

      test("app_mode DESKTOP", () => {
        const infraStore = useInfraStore();
        infraStore.app_mode = appMode.DESKTOP;
        expect(infraStore.domain_name).toBe("localhost");
      });

      test("app_mode CLOUD", () => {
        const infraStore = useInfraStore();
        infraStore.app_mode = appMode.CLOUD;
        expect(infraStore.domain_name).toBe("localhost");
      });
    });

    describe("microservices_connected", () => {
      test("no microservices registered", () => {
        const infraStore = useInfraStore();
        expect(infraStore.microservices_connected).toBe(true);
      });

      test("geode false & viewer false", () => {
        const infraStore = useInfraStore();
        const backStore = useBackStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(backStore);
        infraStore.register_microservice(viewerStore);

        backStore.$patch({ status: Status.NOT_CONNECTED });
        viewerStore.$patch({ status: Status.NOT_CONNECTED });
        expect(infraStore.microservices_connected).toBe(false);
      });

      test("geode true & viewer false", () => {
        const infraStore = useInfraStore();
        const backStore = useBackStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(backStore);
        infraStore.register_microservice(viewerStore);

        backStore.$patch({ status: Status.CONNECTED });
        viewerStore.$patch({ status: Status.NOT_CONNECTED });
        expect(infraStore.microservices_connected).toBe(false);
      });

      test("geode false & viewer true", () => {
        const infraStore = useInfraStore();
        const backStore = useBackStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(backStore);
        infraStore.register_microservice(viewerStore);

        backStore.$patch({ status: Status.NOT_CONNECTED });
        viewerStore.$patch({ status: Status.CONNECTED });
        expect(infraStore.microservices_connected).toBe(false);
      });

      test("geode true & viewer true", () => {
        const infraStore = useInfraStore();
        const backStore = useBackStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(backStore);
        infraStore.register_microservice(viewerStore);

        backStore.$patch({ status: Status.CONNECTED });
        viewerStore.$patch({ status: Status.CONNECTED });
        expect(infraStore.microservices_connected).toBe(true);
      });
    });

    describe("microservices_busy", () => {
      test("no microservices registered", () => {
        const infraStore = useInfraStore();
        expect(infraStore.microservices_busy).toBe(false);
      });

      test("geode false & viewer false", () => {
        const infraStore = useInfraStore();
        const backStore = useBackStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(backStore);
        infraStore.register_microservice(viewerStore);

        backStore.$patch({ request_counter: 0 });
        viewerStore.$patch({ request_counter: 0 });
        expect(infraStore.microservices_busy).toBe(false);
      });

      test("geode true & viewer false", () => {
        const infraStore = useInfraStore();
        const backStore = useBackStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(backStore);
        infraStore.register_microservice(viewerStore);

        backStore.$patch({ request_counter: 1 });
        viewerStore.$patch({ request_counter: 0 });
        expect(infraStore.microservices_busy).toBe(true);
      });

      test("geode false & viewer true", () => {
        const infraStore = useInfraStore();
        const backStore = useBackStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(backStore);
        infraStore.register_microservice(viewerStore);

        backStore.$patch({ request_counter: 0 });
        viewerStore.$patch({ request_counter: 1 });
        expect(infraStore.microservices_busy).toBe(true);
      });

      test("back false & viewer false", () => {
        const infraStore = useInfraStore();
        const backStore = useBackStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(backStore);
        infraStore.register_microservice(viewerStore);

        backStore.$patch({ request_counter: 1 });
        viewerStore.$patch({ request_counter: 1 });
        expect(infraStore.microservices_busy).toBe(true);
      });
    });
  });

  describe("actions", () => {
    describe("register_microservice", () => {
      test("register back microservice", () => {
        const infraStore = useInfraStore();
        const backStore = useBackStore();

        infraStore.register_microservice(backStore);

        expect(infraStore.microservices).toHaveLength(1);
        expect(infraStore.microservices[0]?.$id).toBe("back");
      });

      test("register multiple microservices", () => {
        const infraStore = useInfraStore();
        const backStore = useBackStore();
        const viewerStore = useViewerStore();

        infraStore.register_microservice(backStore);

        infraStore.register_microservice(viewerStore);

        expect(infraStore.microservices).toHaveLength(2);
      });
    });
  });
});
