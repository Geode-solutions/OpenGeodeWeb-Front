<script setup>
  import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"
  import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction"
  import ColorMapList from "./ColorMapList.vue"

  const props = defineProps({
    modelValue: { type: String, default: "Cool to Warm" },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  })

  const emit = defineEmits(["update:modelValue"])

  const menuOpen = ref(false)
  const lutCanvas = ref(null)
  const selectedPresetName = ref(props.modelValue)

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
    if (!lutCanvas.value) return

    const preset = vtkColorMaps.getPresetByName(selectedPresetName.value)
    if (!preset || !preset.RGBPoints) return

    const canvas = lutCanvas.value
    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height

    const lut = vtkColorTransferFunction.newInstance()
    const rgbPoints = preset.RGBPoints

    for (let i = 0; i < rgbPoints.length; i += 4) {
      lut.addRGBPoint(
        rgbPoints[i],
        rgbPoints[i + 1],
        rgbPoints[i + 2],
        rgbPoints[i + 3],
      )
    }

    const presetMin = rgbPoints[0]
    const presetMax = rgbPoints[rgbPoints.length - 4]
    const table = lut.getUint8Table(presetMin, presetMax, width, true)

    const imageData = ctx.createImageData(width, height)
    for (let x = 0; x < width; x++) {
      const r = table[x * 4]
      const g = table[x * 4 + 1]
      const b = table[x * 4 + 2]
      const a = table[x * 4 + 3]

      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4
        imageData.data[idx] = r
        imageData.data[idx + 1] = g
        imageData.data[idx + 2] = b
        imageData.data[idx + 3] = a
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  function onSelectPreset(preset) {
    selectedPresetName.value = preset.Name
    emit("update:modelValue", preset.Name)
    menuOpen.value = false
  }

  onMounted(() => {
    drawLutCanvas()
  })

  watch([selectedPresetName, () => props.min, () => props.max], () => {
    drawLutCanvas()
  })

  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue !== selectedPresetName.value) {
        selectedPresetName.value = newValue
      }
    },
  )
</script>

<template>
  <v-menu v-model="menuOpen" :close-on-content-click="false" offset-y>
    <template #activator="{ props }">
      <div v-bind="props" class="color-map-picker">
        <span class="preset-name">{{ selectedPresetName }}</span>
        <canvas ref="lutCanvas" width="200" height="20" class="lut-canvas" />
      </div>
    </template>
    <ColorMapList :presets="presets" @select="onSelectPreset" />
  </v-menu>
</template>

<style scoped>
  .color-map-picker {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
  }

  .color-map-picker:hover {
    background: #f5f5f5;
  }

  .preset-name {
    font-size: 12px;
    font-weight: 500;
    color: #333;
  }

  .lut-canvas {
    width: 100%;
    height: 20px;
    border: 1px solid #ddd;
    border-radius: 2px;
  }
</style>
