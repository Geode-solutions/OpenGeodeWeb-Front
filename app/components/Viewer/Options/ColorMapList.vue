<template>
  <div class="color-map-list">
    <v-text-field
      v-model="filterText"
      placeholder="Filter color maps..."
      density="compact"
      clearable
      hide-details
      prepend-inner-icon="mdi-magnify"
      class="mb-2"
    />
    <v-list density="compact" max-height="400" class="overflow-y-auto">
      <template v-for="(item, index) in filteredPresets" :key="index">
        <v-list-group v-if="item.Children" :value="item.Name">
          <template #activator="{ props }">
            <v-list-item v-bind="props" :title="item.Name" />
          </template>
          <v-list-item
            v-for="(child, childIndex) in item.Children"
            :key="childIndex"
            @click="$emit('select', child)"
            class="preset-item"
          >
            <v-list-item-title>{{ child.Name }}</v-list-item-title>
            <template #append>
              <canvas
                :ref="(el) => setCanvasRef(child.Name, el)"
                width="100"
                height="20"
                class="preset-canvas"
              />
            </template>
          </v-list-item>
        </v-list-group>
        <v-list-item
          v-else
          :key="index"
          @click="$emit('select', item)"
          class="preset-item"
        >
          <v-list-item-title>{{ item.Name }}</v-list-item-title>
          <template #append>
            <canvas
              :ref="(el) => setCanvasRef(item.Name, el)"
              width="100"
              height="20"
              class="preset-canvas"
            />
          </template>
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, nextTick, watch } from "vue"
  import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"
  import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction"

  const props = defineProps({
    presets: { type: Array, required: true },
  })

  const emit = defineEmits(["select"])

  const filterText = ref("")
  const canvasRefs = ref({})

  const setCanvasRef = (name, el) => {
    if (el) {
      canvasRefs.value[name] = el
    }
  }

  const filteredPresets = computed(() => {
    if (!filterText.value) {
      return props.presets
    }

    const term = filterText.value.toLowerCase()
    const filtered = []

    for (const item of props.presets) {
      if (item.Children) {
        const filteredChildren = item.Children.filter((child) =>
          child.Name.toLowerCase().includes(term)
        )
        if (filteredChildren.length > 0) {
          filtered.push({ ...item, Children: filteredChildren })
        }
      } else if (item.Name.toLowerCase().includes(term)) {
        filtered.push(item)
      }
    }

    return filtered
  })

  function drawPresetCanvas(presetName, canvas) {
    if (!canvas) return

    const preset = vtkColorMaps.getPresetByName(presetName)
    if (!preset || !preset.RGBPoints) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height

    const lut = vtkColorTransferFunction.newInstance()
    const rgbPoints = preset.RGBPoints

    for (let i = 0; i < rgbPoints.length; i += 4) {
      lut.addRGBPoint(rgbPoints[i], rgbPoints[i + 1], rgbPoints[i + 2], rgbPoints[i + 3])
    }

    const range = [rgbPoints[0], rgbPoints[rgbPoints.length - 4]]
    const table = lut.getUint8Table(range[0], range[1], width, true)

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

  function drawAllCanvases() {
    nextTick(() => {
      Object.entries(canvasRefs.value).forEach(([name, canvas]) => {
        drawPresetCanvas(name, canvas)
      })
    })
  }

  onMounted(() => {
    drawAllCanvases()
  })

  // Redraw when filter changes
  watch(filteredPresets, () => {
    drawAllCanvases()
  })
</script>

<style scoped>
  .color-map-list {
    width: 350px;
    padding: 8px;
  }

  .preset-item {
    cursor: pointer;
  }

  .preset-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .preset-canvas {
    border: 1px solid #ccc;
    border-radius: 2px;
  }
</style>
