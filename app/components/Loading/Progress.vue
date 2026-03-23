<script setup>
  const { progress } = defineProps({
    progress: {
      type: Number,
      required: true,
    },
  })
</script>

<template>
  <v-sheet color="transparent" class="position-relative overflow-visible pt-8">
    <v-progress-linear
      indeterminate
      :model-value="progress"
      color="white"
      height="8"
      rounded
      style="background: rgba(255, 255, 255, 0.1)"
    >
      <template v-slot:default="{ value }">
        <v-sheet
          color="transparent"
          class="d-flex justify-end position-absolute h-100"
          :style="{
            width: value + '%',
            left: 0,
            transition: 'width 0.15s linear',
          }"
        >
          <v-chip
            color="white"
            size="small"
            variant="flat"
            class="position-absolute font-weight-black"
            style="
              top: -40px;
              right: -20px;
              box-shadow: 0 0 12px rgba(var(--v-theme-primary), 0.6);
            "
          >
            {{ Math.round(value) }}%
          </v-chip>
        </v-sheet>
      </template>
    </v-progress-linear>
  </v-sheet>
</template>
