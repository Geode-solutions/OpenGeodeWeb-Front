interface StepperTreeApi {
  state: Record<string, unknown>;
  update_values: (keys_values_object: Readonly<Record<string, unknown>>) => void;
  increment_step: () => void;
  decrement_step: () => void;
  reset_values: () => void;
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function get_current_step_index(state: Readonly<Record<string, unknown>>): number {
  const value = state.current_step_index;
  return typeof value === "number" ? value : 0;
}

function build_initial_state_unref(
  initial_state: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const initial_state_unref: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(initial_state)) {
    const unref_val: unknown = unref(value);
    initial_state_unref[key] = isUnknownArray(unref_val) ? [...unref_val] : unref_val;
  }
  return initial_state_unref;
}

export function useStepperTree(
  steps: readonly unknown[],
  initial_state: Readonly<Record<string, unknown>> = {},
): StepperTreeApi {
  const initial_state_unref = build_initial_state_unref(initial_state);
  const state = reactive<Record<string, unknown>>({
    current_step_index: 0,
    navigating_back: false,
    steps,
    ...initial_state,
  });

  watch(
    () => get_current_step_index(state),
    (newVal, oldVal) => {
      if (newVal < oldVal) {
        state.navigating_back = true;
      }
    },
  );

  function update_values(keys_values_object: Readonly<Record<string, unknown>>): void {
    for (const [key, value] of Object.entries(keys_values_object)) {
      state[key] = value;
    }
  }

  function increment_step(): void {
    state.current_step_index = get_current_step_index(state) + 1;
  }

  function decrement_step(): void {
    state.current_step_index = get_current_step_index(state) - 1;
  }

  function reset_values(): void {
    state.current_step_index = 0;
    state.navigating_back = false;
    for (const [key, initial_val] of Object.entries(initial_state_unref)) {
      state[key] = isUnknownArray(initial_val) ? [...initial_val] : initial_val;
    }
  }

  return {
    state,
    update_values,
    increment_step,
    decrement_step,
    reset_values,
  };
}
