<script setup>
  const colorPickerRef = useTemplateRef("colorPickerRef")
  const model = defineModel()
  const { pressed } = useMousePressed({ target: colorPickerRef })

  const color = ref(model)

  watch(pressed, (value) => {
    if (!value) {
      model.value = color.value
    }
  })
</script>

<template>
  <v-color-picker
    ref="colorPickerRef"
    v-model="color"
    flat
    canvas-height="100"
    hide-inputs
    width="100%"
    mode="rgb"
  />
</template>
