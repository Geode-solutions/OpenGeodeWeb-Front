<template>
  <v-stepper-vertical-item
    :value="step_index"
    hide-actions
    class="custom-step-item"
  >
    <template v-slot:title>
      <div
        class="d-flex align-center py-3 px-2 cursor-pointer step-header"
        @click="set_current_step(step_index)"
      >
        <v-avatar
          size="48"
          :color="
            current_step_index == step_index
              ? 'primary'
              : current_step_index > step_index
                ? 'success'
                : 'grey-lighten-3'
          "
          class="mr-4 elevation-2 step-icon-container"
        >
          <v-icon
            v-if="current_step_index > step_index"
            icon="mdi-check"
            color="white"
            size="28"
          />
          <v-icon
            v-else
            :icon="`mdi-numeric-${step_index + 1}`"
            :color="current_step_index == step_index ? 'white' : 'grey-darken-1'"
            size="28"
            class="font-weight-bold"
          />
        </v-avatar>

        <div class="flex-grow-1">
          <h3
            class="text-h6 font-weight-bold mb-0 transition-swing"
            :class="
              current_step_index == step_index
                ? 'text-primary'
                : 'text-grey-darken-1'
            "
          >
            {{ steps[step_index].step_title }}
          </h3>
          <div
            v-if="
              steps[step_index].chips.length && current_step_index >= step_index
            "
            class="d-flex flex-wrap mt-2"
          >
            <v-chip
              v-for="(chip, chip_index) in steps[step_index].chips"
              :key="chip_index"
              size="x-small"
              class="mr-1 mb-1 font-weight-medium"
              color="primary"
              variant="tonal"
            >
              {{ truncate(chip, 30) }}
            </v-chip>
          </div>
        </div>

        <v-icon
          v-if="current_step_index == step_index"
          icon="mdi-chevron-down"
          color="primary"
          class="ml-2"
        />
      </div>
    </template>

    <div class="step-content-wrapper pa-4 pt-0">
      <v-divider class="mb-6 opacity-10" />
      <component
        v-if="step_index == current_step_index"
        :key="step_index"
        :is="steps[step_index].component.component_name"
        v-bind="steps[step_index].component.component_options"
        @increment_step="increment_step"
        @decrement_step="decrement_step"
        @update_values="update_values_event"
        @reset_values="$emit('reset_values')"
      />
    </div>
  </v-stepper-vertical-item>
</template>

<script setup>
  function truncate(text, maxLength) {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "..."
    }
    return text
  }

  const props = defineProps({
    step_index: { type: Number, required: true },
  })

  const stepper_tree = inject("stepper_tree")
  const { current_step_index, steps } = toRefs(stepper_tree)

  function set_current_step(step_index) {
    stepper_tree.current_step_index = step_index
  }

  function update_values_event(keys_values_object) {
    for (const [key, value] of Object.entries(keys_values_object)) {
      stepper_tree[key] = value
    }
  }

  function increment_step() {
    stepper_tree.current_step_index++
  }

  function decrement_step() {
    stepper_tree.current_step_index--
  }

  const sortedChips = computed(() => {
    const chips = steps.value[props.step_index]?.chips || []
    return [...chips].sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    )
  })
</script>

<style scoped>
  .step-header {
    transition: all 0.2s ease;
    border-radius: 16px;
  }

  .step-header:hover {
    background-color: rgba(var(--v-theme-primary), 0.05);
  }

  .step-icon-container {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .step-header:hover .step-icon-container {
    transform: scale(1.1);
  }

  .custom-step-item {
    transition: all 0.4s ease;
  }

  :deep(.v-stepper-vertical-item__content) {
    padding: 0 !important;
  }

  .step-content-wrapper {
    animation: slideIn 0.4s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
