export function useStepperTree(initial_state = {}) {
  const initial_state_unref = {};
  for (const [key, value] of Object.entries(initial_state)) {
    if (key === "steps") {
      continue;
    }
    const unref_val = unref(value);
    if (Array.isArray(unref_val)) {
      initial_state_unref[key] = [...unref_val];
    } else {
      initial_state_unref[key] = unref_val;
    }
  }
  const state = reactive({
    current_step_index: 0,
    navigating_back: false,
    ...initial_state,
  });

  watch(
    () => state.current_step_index,
    (newVal, oldVal) => {
      if (newVal < oldVal) {
        state.navigating_back = true;
      }
    },
  );

  function update_values(keys_values_object) {
    for (const [key, value] of Object.entries(keys_values_object)) {
      state[key] = value;
    }
  }

  function increment_step() {
    state.current_step_index += 1;
  }

  function decrement_step() {
    state.current_step_index -= 1;
  }

  function reset_values() {
    state.current_step_index = 0;
    state.navigating_back = false;
    for (const [key, initial_val] of Object.entries(initial_state_unref)) {
      state[key] = Array.isArray(initial_val) ? [...initial_val] : initial_val;
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
