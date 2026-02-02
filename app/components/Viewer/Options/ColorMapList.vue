<script setup>
  import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"
  import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction"

  const props = defineProps({
    presets: { type: Array, required: true },
  })

  const emit = defineEmits(["select"])

  const filterText = ref("")
  const canvasRefs = ref({})
  const loading = ref(true)
  let renderJobId = 0

  const setCanvasRef = (presetName, el, id) => {
    if (el) {
      canvasRefs.value[id] = { el, presetName }
    } else {
      delete canvasRefs.value[id]
    }
  }

  const filteredPresets = computed(() => {
    if (!filterText.value) return props.presets
    const term = filterText.value.toLowerCase()

    return props.presets.reduce((acc, item) => {
      if (item.Children) {
        const children = item.Children.filter((c) =>
          c.Name.toLowerCase().includes(term),
        )
        if (children.length) acc.push({ ...item, Children: children })
      } else if (item.Name.toLowerCase().includes(term)) {
        acc.push(item)
      }
      return acc
    }, [])
  })

  function drawPresetCanvas(presetName, canvas) {
    if (!canvas) return
    const preset = vtkColorMaps.getPresetByName(presetName)
    if (!preset || !preset.RGBPoints) return

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

  async function drawAllCanvases() {
    renderJobId++
    const currentJobId = renderJobId
    loading.value = true
    await nextTick()
    await new Promise((r) => setTimeout(r, 50))

    const entries = Object.entries(canvasRefs.value)
    for (let i = 0; i < entries.length; i += 5) {
      if (currentJobId !== renderJobId) return
      entries
        .slice(i, i + 5)
        .forEach(([_, { presetName, el }]) => drawPresetCanvas(presetName, el))
      await new Promise((r) => setTimeout(r, 0))
    }
    if (currentJobId === renderJobId) loading.value = false
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
