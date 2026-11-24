import { summarizeParams } from "@ogw_front/utils/console_params";

// Read-only journal of what the app is doing: microservice requests, server events, connection changes
const MAX_ENTRIES = 500;

type ConsoleEntryKind = "http" | "ws" | "upload" | "event" | "connection";
type ConsoleEntryStatus = "running" | "success" | "error" | "timeout" | "info";
type ConsoleOutcome = { status: "success" } | { status: "error" | "timeout"; error: string };

interface ConsoleEntry {
  id: number;
  source: string;
  kind: ConsoleEntryKind;
  route: string;
  status: ConsoleEntryStatus;
  started_at: number;
  label?: string;
  params?: string;
  duration_ms?: number;
  error?: string;
}

interface ConsoleEntryInput {
  source: string;
  kind: ConsoleEntryKind;
  route: string;
  label?: string;
  params?: unknown;
}

interface ConsoleLogInput extends ConsoleEntryInput {
  status: ConsoleEntryStatus;
  started_at?: number;
  duration_ms?: number;
  error?: string;
}

function isFailure(status: ConsoleEntryStatus): boolean {
  return status === "error" || status === "timeout";
}

// oxlint-disable-next-line max-lines-per-function
const useConsoleStore = defineStore("console", () => {
  const entries = ref<ConsoleEntry[]>([]);
  const unseen_errors = ref(0);
  let next_id = 0;

  const running = computed(() => entries.value.filter((entry) => entry.status === "running"));
  const error_count = computed(
    () => entries.value.filter((entry) => isFailure(entry.status)).length,
  );

  function push(entry: ConsoleEntry): void {
    entries.value.push(entry);
    if (entries.value.length > MAX_ENTRIES) {
      entries.value.splice(0, entries.value.length - MAX_ENTRIES);
    }
    if (isFailure(entry.status)) {
      unseen_errors.value += 1;
    }
  }

  function create(input: ConsoleLogInput): ConsoleEntry {
    next_id += 1;
    const entry: ConsoleEntry = {
      id: next_id,
      source: input.source,
      kind: input.kind,
      route: input.route,
      status: input.status,
      started_at: input.started_at ?? Date.now(),
    };
    const params = summarizeParams(input.params);
    if (params !== undefined) {
      entry.params = params;
    }
    if (input.label !== undefined) {
      entry.label = input.label;
    }
    if (input.duration_ms !== undefined) {
      entry.duration_ms = input.duration_ms;
    }
    if (input.error !== undefined) {
      entry.error = input.error;
    }
    return entry;
  }

  function start_request(input: ConsoleEntryInput): number {
    const entry = create({ ...input, status: "running" });
    push(entry);
    return entry.id;
  }

  function finish_request(entryId: number, outcome: ConsoleOutcome): void {
    const entry = entries.value.find((candidate) => candidate.id === entryId);
    if (entry === undefined) {
      return;
    }
    entry.duration_ms = Date.now() - entry.started_at;
    entry.status = outcome.status;
    if (outcome.status !== "success") {
      entry.error = outcome.error;
      unseen_errors.value += 1;
    }
  }

  function log(input: ConsoleLogInput): void {
    push(create(input));
  }

  // Empties the view only: running requests stay, they will still finish
  function clear(): void {
    entries.value = entries.value.filter((entry) => entry.status === "running");
    unseen_errors.value = 0;
  }

  function mark_errors_seen(): void {
    unseen_errors.value = 0;
  }

  return {
    entries,
    unseen_errors,
    running,
    error_count,
    start_request,
    finish_request,
    log,
    clear,
    mark_errors_seen,
  };
});

export { MAX_ENTRIES, useConsoleStore };
export type { ConsoleEntry, ConsoleEntryKind, ConsoleEntryStatus, ConsoleOutcome };
