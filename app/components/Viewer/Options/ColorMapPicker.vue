<script setup>
  import ColorMapList from "./ColorMapList.vue"
  import { newInstance } from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction"
  import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"

  const LAST_POINT_OFFSET = 4
  const THREE = 3

  const { max, min, modelValue } = defineProps({
    modelValue: { type: String, default: "Cool to Warm" },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  })

  const emit = defineEmits(["update:modelValue"])

  const menuOpen = ref(false)
  const lutCanvas = ref()
  const selectedPresetName = ref(modelValue)

  const presets = computed(() => {
    const allPresets = vtkColorMaps.rgbPresetNames.map((name) =>
      vtkColorMaps.getPresetByName(name),
    )

    const defaultPreset = vtkColorMaps.getPresetByName("Cool to Warm")

    const paraviewNames = [
      "Cool to Warm",
      "Warm to Cool",
      "rainbow",
      "Grayscale",
      "X Ray",
      "Black-Body Radiation",
      "erdc_rainbow_bright",
    ]
    const matplotlibNames = [
      "Viridis (matplotlib)",
      "Plasma (matplotlib)",
      "Inferno (matplotlib)",
      "Magma (matplotlib)",
    ]

    const paraviewPresets = paraviewNames
      .map((name) => vtkColorMaps.getPresetByName(name))
      .filter(Boolean)
    const matplotlibPresets = matplotlibNames
      .map((name) => vtkColorMaps.getPresetByName(name))
      .filter(Boolean)
    const otherPresets = allPresets.filter(
      (preset) =>
        !paraviewNames.includes(preset.Name) &&
        !matplotlibNames.includes(preset.Name),
    )

    return [
      defaultPreset,
      { Name: "ParaView", Children: paraviewPresets },
      { Name: "Matplotlib", Children: matplotlibPresets },
      { Name: "Others", Children: otherPresets },
    ]
  })

  function drawLutCanvas() {
    if (!lutCanvas.value) {
      return
    }
    const preset = vtkColorMaps.getPresetByName(selectedPresetName.value)
    if (!preset || !preset.RGBPoints) {
      return
    }

    const canvas = lutCanvas.value
    const ctx = canvas.getContext("2d")
    const { height, width } = canvas

    const lut = newInstance()
    const rgbPoints = preset.RGBPoints

    for (let pointIdx = 0; pointIdx < rgbPoints.length; pointIdx += 4) {
      lut.addRGBPoint(
        rgbPoints[pointIdx],
        rgbPoints[pointIdx + 1],
        rgbPoints[pointIdx + 2],
        rgbPoints[pointIdx + THREE],
      )
    }

    const table = lut.getUint8Table(
      rgbPoints[0],
      rgbPoints.at(-LAST_POINT_OFFSET),
      width,
      true,
    )
    const imageData = ctx.createImageData(width, height)

    for (let xCoord = 0; xCoord < width; xCoord += 1) {
      const red = table[xCoord * 4]
      const green = table[xCoord * 4 + 1]
      const blue = table[xCoord * 4 + 2]
      const alpha = table[xCoord * 4 + THREE]
      for (let yCoord = 0; yCoord < height; yCoord += 1) {
        const pixelIdx = (yCoord * width + xCoord) * 4
        imageData.data[pixelIdx] = red
        imageData.data[pixelIdx + 1] = green
        imageData.data[pixelIdx + 2] = blue
        imageData.data[pixelIdx + THREE] = alpha
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }

  function onSelectPreset(preset) {
    selectedPresetName.value = preset.Name
    emit("update:modelValue", preset.Name)
    menuOpen.value = false
  }

  onMounted(() => nextTick(drawLutCanvas))
  watch([lutCanvas, selectedPresetName, () => min, () => max], drawLutCanvas)
  watch(
    () => modelValue,
    (nv) => {
      if (nv !== selectedPresetName.value) {
        selectedPresetName.value = nv
      }
    },
  )
</script>

<template>
  <v-menu v-model="menuOpen" :close-on-content-click="false" location="bottom">
    <template #activator="{ props: menuProps }">
      <v-card
        v-bind="menuProps"
        theme="dark"
        variant="outlined"
        rounded="sm"
        class="pa-2 blur-picker d-flex flex-column"
        style="gap: 4px; cursor: pointer"
      >
        <span class="text-caption text-white font-weight-medium">
          {{ selectedPresetName }}
        </span>
        <canvas
          ref="lutCanvas"
          width="200"
          height="18"
          class="w-100 rounded-xs border-thin"
        />
      </v-card>
    </template>

    <ColorMapList :presets="presets" @select="onSelectPreset" />
  </v-menu>
</template>

<style scoped>
  .blur-picker {
    background-color: rgba(40, 40, 40, 0.7) !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-color: rgba(255, 255, 255, 0.2) !important;
    transition: background-color 0.2s;
  }

  .blur-picker {
    background-color: rgba(60, 60, 60, 0.9) !important;
  }

  .border-thin {
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
  }
</style>
