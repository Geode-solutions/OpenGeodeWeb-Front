<template>
  <v-stepper-content :step="props.step_index + 1">
    <v-row
      align="center"
      class="mb-4 py-2"
      @click="set_current_step(props.step_index)"
    >
      <v-col cols="auto" class="d-flex justify-center align-center">
        <v-icon
          v-if="props.active_step_index > props.step_index"
          icon="mdi-check-circle"
          color="grey"
        />
        <v-icon
          v-else-if="props.active_step_index == props.step_index"
          :icon="`mdi-numeric-${props.step_index + 1}-circle`"
          color="primary"
        />
        <v-icon
          v-else
          :icon="`mdi-numeric-${props.step_index + 1}-circle`"
          color="grey"
        />
      </v-col>
      <v-col>
        <p class="m-0 font-weight-bold">
          {{ props.step.title }}
        </p>
      </v-col>
      <v-chip-group
        v-if="
          props.step.chips.length && props.active_step_index >= props.step_index
        "
        column
        class="d-flex flex-wrap ma-2 overflow-y-auto"
        multiple
        style="max-height: 150px"
      >
        <v-chip
          v-for="(chip, chip_index) in props.step.chips"
          :key="chip_index"
          class="ma-1"
          :title="chip"
        >
          {{ truncate(chip, 50) }}
        </v-chip>
      </v-chip-group>
    </v-row>
    <component
      v-if="props.step_index == props.active_step_index"
      :key="props.step_index"
      :is="props.step.component.component_name"
      v-bind="props.step.component.component_options"
      @update_values="update_values_event"
      @reset_values="emit('reset_values')"
      @increment_step="increment_step()"
      @decrement_step="decrement_step()"
    />
  </v-stepper-content>
</template>

<script setup>
  const emit = defineEmits(["reset_values"])

  function truncate(text, maxLength) {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "..."
    }
    return text
  }

  const props = defineProps({
    step_index: { type: Number, required: true },
    active_step_index: { type: Number, required: true },
    step: { type: Object, required: true },
  })

  function set_current_step(step_index) {
    stepper_tree.current_step_index = step_index
  }

  function update_values_event(keys_values_object) {
    for (const [key, value] of Object.entries(keys_values_object)) {
      stepper_tree[key] = value
      console.log("key", key)
      console.log("value", value)
      console.log("stepper_tree[key]", stepper_tree[key])
    }
  }

  function increment_step() {
    stepper_tree.current_step_index++
  }

  function decrement_step() {
    stepper_tree.current_step_index--
  }
</script>
