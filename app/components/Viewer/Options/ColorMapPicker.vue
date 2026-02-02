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
    const { width, height } = canvas

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

    const table = lut.getUint8Table(
      rgbPoints[0],
      rgbPoints[rgbPoints.length - 4],
      width,
      true,
    )
    const imageData = ctx.createImageData(width, height)

    for (let x = 0; x < width; x++) {
      const r = table[x * 4],
        g = table[x * 4 + 1],
        b = table[x * 4 + 2],
        a = table[x * 4 + 3]
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

  onMounted(() => nextTick(drawLutCanvas))
  watch(
    [lutCanvas, selectedPresetName, () => props.min, () => props.max],
    drawLutCanvas,
  )
  watch(
    () => props.modelValue,
    (nv) => {
      if (nv !== selectedPresetName.value) selectedPresetName.value = nv
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
