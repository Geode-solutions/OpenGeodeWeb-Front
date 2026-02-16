<script setup>
  import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"
  import { newInstance as vtkColorTransferFunction } from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction"

  const LAST_POINT_OFFSET = 4
  const THREE = 3
  const CHUNK_SIZE = 5

  const { presets } = defineProps({
    presets: { type: Array, required: true },
  })

  const emit = defineEmits(["select"])

  const filterText = ref("")
  const canvasRefs = ref({})
  const loading = ref(true)
  let renderJobId = 0

  function setCanvasRef(presetName, el, id) {
    if (el) {
      canvasRefs.value[id] = { el, presetName }
    } else {
      delete canvasRefs.value[id]
    }
  }

  const filteredPresets = computed(() => {
    if (!filterText.value) return presets
    const term = filterText.value.toLowerCase()

    const result = []
    for (const item of presets) {
      if (item.Children) {
        const children = item.Children.filter((child) =>
          child.Name.toLowerCase().includes(term),
        )
        if (children.length > 0) result.push({ ...item, Children: children })
      } else if (item.Name.toLowerCase().includes(term)) {
        result.push(item)
      }
    }
    return result
  })

  function drawPresetCanvas(presetName, canvas) {
    if (!canvas) return
    const preset = vtkColorMaps.getPresetByName(presetName)
    if (!preset || !preset.RGBPoints) return

    const ctx = canvas.getContext("2d")
    const { height, width } = canvas
    const lut = vtkColorTransferFunction()
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
      const alpha = table[xCoord * 4 + THREE],
        blue = table[xCoord * 4 + 2],
        green = table[xCoord * 4 + 1],
        red = table[xCoord * 4]
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

  function processChunk(entries, index, jobId) {
    if (jobId !== renderJobId || index >= entries.length) {
      if (jobId === renderJobId) loading.value = false
      return
    }

    const end = Math.min(index + CHUNK_SIZE, entries.length)
    for (let i = index; i < end; i += 1) {
      const [unusedKey, refValue] = entries[i]
      drawPresetCanvas(refValue.presetName, refValue.el)
    }
    const ZERO = 0
    setTimeout(() => processChunk(entries, end, jobId), ZERO)
  }

  function drawAllCanvases() {
    renderJobId += 1
    const jobId = renderJobId
    loading.value = true
    nextTick(() => {
      const WAIT_MS = 50
      setTimeout(
        () => processChunk(Object.entries(canvasRefs.value), 0, jobId),
        WAIT_MS,
      )
    })
  }

  onMounted(drawAllCanvases)
  watch(filteredPresets, drawAllCanvases)
</script>

<template>
  <v-card
    width="320"
    class="pa-3 blur-card overflow-hidden"
    theme="dark"
    variant="outlined"
    rounded="lg"
  >
    <v-overlay
      v-model="loading"
      contained
      persistent
      class="align-center justify-center"
      scrim="#1e1e1e"
      opacity="0.6"
    >
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>

    <v-text-field
      v-model="filterText"
      placeholder="Search presets..."
      density="compact"
      hide-details
      prepend-inner-icon="mdi-magnify"
      variant="solo-filled"
      flat
      class="mb-3"
      base-color="white"
      color="white"
    />

    <v-list
      density="compact"
      max-height="350"
      bg-color="transparent"
      class="pa-0"
      :style="{ opacity: loading ? '0.3' : '1', transition: 'opacity 0.2s' }"
    >
      <template v-for="(item, index) in filteredPresets" :key="index">
        <v-list-group v-if="item.Children" :value="item.Name">
          <template #activator="{ props: gProps }">
            <v-list-item
              v-bind="gProps"
              :title="item.Name"
              class="text-white font-weight-bold"
            />
          </template>

          <v-list-item
            v-for="(child, cIdx) in item.Children"
            :key="cIdx"
            @click="$emit('select', child)"
            class="px-2 mb-1"
            rounded="md"
          >
            <div class="d-flex flex-column py-1">
              <span class="text-caption text-grey-lighten-1 mb-1">{{
                child.Name
              }}</span>
              <canvas
                :ref="
                  (el) => setCanvasRef(child.Name, el, `g-${index}-${cIdx}`)
                "
                width="200"
                height="18"
                class="w-100 rounded-xs border-thin"
              />
            </div>
          </v-list-item>
        </v-list-group>

        <v-list-item
          v-else
          @click="$emit('select', item)"
          class="px-2 mb-1"
          rounded="md"
        >
          <div class="d-flex flex-column py-1">
            <span class="text-caption text-grey-lighten-1 mb-1">{{
              item.Name
            }}</span>
            <canvas
              :ref="(el) => setCanvasRef(item.Name, el, `s-${index}`)"
              width="200"
              height="18"
              class="w-100 rounded-xs border-thin"
            />
          </div>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>

<style scoped>
  .blur-card {
    background-color: rgba(35, 35, 35, 0.8) !important;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-color: rgba(255, 255, 255, 0.1) !important;
  }

  .border-thin {
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
  }

  .v-list-item {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
</style>
