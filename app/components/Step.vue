<template>
  <v-stepper-vertical-item
    :value="step_index + 1"
    :editable="step_index < current_step_index"
    color="primary"
    hide-actions
    class="custom-step-item"
  >
    <template v-slot:title>
      <div class="step-title-wrapper">
        <h3
          class="text-subtitle-1 font-weight-bold mb-0 transition-swing"
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
            size="small"
            class="mr-2 mb-1 font-weight-medium"
            color="primary"
            variant="tonal"
          >
            {{ truncate(chip, 30) }}
          </v-chip>
        </div>
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

  watch(current_step_index, (newVal, oldVal) => {
    if (newVal < oldVal) {
      stepper_tree.navigating_back = true
    }
  })

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
  .custom-step-item {
    transition: all 0.4s ease;
  }

  :deep(.v-stepper-vertical-item__header) {
    align-items: center !important;
    padding-top: 16px !important;
    padding-bottom: 16px !important;
  }

  :deep(.v-stepper-vertical-item__avatar) {
    background: transparent !important;
    color: #6b7280 !important;
    font-weight: 700 !important;
    box-shadow: none !important;
    border: 2px solid #e5e7eb !important;
  }

  :deep(.v-stepper-vertical-item--active .v-stepper-vertical-item__avatar) {
    background: rgba(var(--v-theme-primary), 0.1) !important;
    color: rgb(var(--v-theme-primary)) !important;
    border-color: rgb(var(--v-theme-primary)) !important;
  }

  :deep(.v-stepper-vertical-item--complete .v-stepper-vertical-item__avatar) {
    background: rgb(var(--v-theme-primary)) !important;
    color: white !important;
    border-color: rgb(var(--v-theme-primary)) !important;
  }

  :deep(.v-stepper-vertical-item__step-line) {
    border-left: 1px solid #e5e7eb !important;
  }

  .step-title-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 24px;
    padding-left: 8px;
  }

  .text-primary {
    color: rgb(var(--v-theme-primary)) !important;
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
