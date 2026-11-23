import { Status } from "@ogw_front/utils/status";

const LOCALHOST = "localhost";
const IPV4_LOOPBACK = "127.0.0.1";

export const useInfraStore = defineStore(
  "infra",
  // oxlint-disable-next-line max-lines-per-function
  () => {
    const app_mode = ref(useRuntimeConfig().public.MODE);
    // Set by the backend lifecycle (utils/backend_lifecycle.ts), which creates the backend
    const status = ref(Status.NOT_CREATED);
    const microservices = ref<Microservice[]>([]);
    const domain_name = ref(globalThis.location.hostname);

    const microservices_connected = computed(() =>
      microservices.value.every((store: Microservice) => store.status === Status.CONNECTED),
    );
    const microservices_busy = computed(() =>
      microservices.value.some((store: Microservice) => store.is_busy === true),
    );
    // The local Flask microservices (Werkzeug) only listen on IPv4. With "localhost", browsers try ::1 first.
    // Windows is slow to refuse it: every request to them would pay that delay.
    // The page host stays in domain_name: the app store must remain same-origin (its API has no CORS).
    const microservice_domain_name = computed(() =>
      domain_name.value === LOCALHOST ? IPV4_LOOPBACK : domain_name.value,
    );

    function register_microservice(store: Microservice): void {
      const store_name = store.$id;
      if (!microservices.value.some((microservice) => microservice.$id === store_name)) {
        microservices.value.push(store);
      }
    }

    function unregister_microservice(microserviceId: string): void {
      microservices.value = microservices.value.filter(
        (microservice) => microservice.$id !== microserviceId,
      );
    }

    async function create_connection(): Promise<void> {
      await Promise.all(
        microservices.value.map(async (store: Microservice) => {
          await store.connect();
        }),
      );
    }

    function set_status(value: string): void {
      status.value = value;
    }

    function set_domain_name(value: string): void {
      domain_name.value = value;
    }

    return {
      app_mode,
      status,
      microservices,
      domain_name,
      microservices_connected,
      microservices_busy,
      microservice_domain_name,
      register_microservice,
      unregister_microservice,
      set_status,
      set_domain_name,
      create_connection,
    };
  },
  {
    share: {
      omit: ["microservices"],
    },
  },
);

export interface Microservice {
  $id: string;
  status?: string;
  is_busy?: boolean;
  launch?: (params: { projectFolderPath: string }) => Promise<unknown>;
  connect: () => void | Promise<void>;
}
