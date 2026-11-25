import { summarizeParams } from "@ogw_front/utils/activity_params";

// Read-only journal of what the app is doing: microservice requests, server events, connection changes
const MAX_ENTRIES = 500;

type ActivityEntryKind = "http" | "ws" | "upload" | "event" | "connection";
type ActivityEntryStatus = "running" | "success" | "error" | "timeout" | "info";
type ActivityOutcome = { status: "success" } | { status: "error" | "timeout"; error: string };

interface ActivityEntry {
  id: number;
  source: string;
  kind: ActivityEntryKind;
  route: string;
  status: ActivityEntryStatus;
  started_at: number;
  label?: string;
  params?: string;
  duration_ms?: number;
  error?: string;
}

interface ActivityEntryInput {
  source: string;
  kind: ActivityEntryKind;
  route: string;
  label?: string;
  params?: unknown;
}

interface ActivityLogInput extends ActivityEntryInput {
  status: ActivityEntryStatus;
  started_at?: number;
  duration_ms?: number;
  error?: string;
}

// An error or a timeout: what the activity panel counts and shows in red
function isFailure(status: ActivityEntryStatus): boolean {
  return status === "error" || status === "timeout";
}

function createEntry(id: number, input: ActivityLogInput): ActivityEntry {
  const { params, started_at, ...fields } = input;
  const summary = summarizeParams(params);
  return {
    ...fields,
    id,
    started_at: started_at ?? Date.now(),
    ...(summary !== undefined && { params: summary }),
  };
}

// The errors not seen yet, counted in one place whether logged at once or failed later
function useUnseenErrors(): {
  unseen_errors: Ref<number>;
  countFailure: (status: ActivityEntryStatus) => void;
  mark_errors_seen: () => void;
} {
  const unseen_errors = ref(0);
  function countFailure(status: ActivityEntryStatus): void {
    if (isFailure(status)) {
      unseen_errors.value += 1;
    }
  }
  function mark_errors_seen(): void {
    unseen_errors.value = 0;
  }
  return { unseen_errors, countFailure, mark_errors_seen };
}

const useActivityStore = defineStore("activity", () => {
  const entries = ref<ActivityEntry[]>([]);
  const { unseen_errors, countFailure, mark_errors_seen } = useUnseenErrors();
  let next_id = 0;

  const running = computed(() => entries.value.filter((entry) => entry.status === "running"));
  const error_count = computed(
    () => entries.value.filter((entry) => isFailure(entry.status)).length,
  );

  function log(input: ActivityLogInput): ActivityEntry {
    next_id += 1;
    const entry = createEntry(next_id, input);
    entries.value.push(entry);
    if (entries.value.length > MAX_ENTRIES) {
      entries.value.splice(0, entries.value.length - MAX_ENTRIES);
    }
    countFailure(entry.status);
    return entry;
  }

  function start_request(input: ActivityEntryInput): number {
    return log({ ...input, status: "running" }).id;
  }

  function finish_request(entryId: number, outcome: ActivityOutcome): void {
    const entry = entries.value.find((candidate) => candidate.id === entryId);
    if (entry === undefined) {
      return;
    }
    entry.duration_ms = Date.now() - entry.started_at;
    entry.status = outcome.status;
    if (outcome.status !== "success") {
      entry.error = outcome.error;
    }
    countFailure(outcome.status);
  }

  // Empties the view only: running requests stay, they will still finish
  function clear(): void {
    entries.value = entries.value.filter((entry) => entry.status === "running");
    mark_errors_seen();
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

export { MAX_ENTRIES, isFailure, useActivityStore };
export type { ActivityEntry, ActivityEntryKind, ActivityEntryStatus, ActivityOutcome };
