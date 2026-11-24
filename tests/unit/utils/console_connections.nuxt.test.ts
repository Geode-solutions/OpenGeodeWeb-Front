// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { nextTick } from "vue";

// Local imports
import { type Microservice, useInfraStore } from "@ogw_front/stores/infra";
import { Status } from "@ogw_front/utils/status";
import { setupActivePinia } from "@ogw_tests/utils";
import { useConsoleStore } from "@ogw_front/stores/console";
import { watchMicroserviceConnections } from "@ogw_front/utils/console_connections";

vi.setConfig({ testTimeout: 10_000 });

const FIRST_INDEX = 0;
const SECOND_INDEX = 1;

function registerFakeMicroservice(): Microservice {
  const infraStore = useInfraStore();
  infraStore.register_microservice({
    $id: "back",
    status: Status.NOT_CONNECTED,
    connect: async () => {
      await Promise.resolve();
    },
  });
  const [microservice] = infraStore.microservices;
  if (microservice === undefined) {
    throw new Error("The fake microservice was not registered");
  }
  return microservice;
}

describe("watchMicroserviceConnections()", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("a microservice that never connected is not logged", async () => {
    registerFakeMicroservice();
    watchMicroserviceConnections();
    await nextTick();
    expect(useConsoleStore().entries).toHaveLength(0);
  });

  test("connection and loss are logged", async () => {
    const microservice = registerFakeMicroservice();
    const consoleStore = useConsoleStore();
    watchMicroserviceConnections();
    microservice.status = Status.CONNECTED;
    await nextTick();
    microservice.status = Status.NOT_CONNECTED;
    await nextTick();
    expect(consoleStore.entries).toHaveLength(2);
    expect(consoleStore.entries[FIRST_INDEX]).toMatchObject({
      source: "back",
      kind: "connection",
      route: "Connected",
      status: "info",
    });
    expect(consoleStore.entries[SECOND_INDEX]).toMatchObject({
      route: "Connection lost",
      status: "error",
    });
  });
});
