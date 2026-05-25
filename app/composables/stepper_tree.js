export function useStepperTree(initial_state = {}) {
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

  function reset_values(default_values = {}) {
    state.current_step_index = 0;
    state.navigating_back = false;
    for (const [key, value] of Object.entries(default_values)) {
      state[key] = value;
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
