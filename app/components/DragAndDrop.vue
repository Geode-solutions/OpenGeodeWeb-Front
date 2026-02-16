<script setup>
  const props = defineProps({
    multiple: { type: Boolean, default: false },
    accept: { type: String, default: "" },
    loading: { type: Boolean, default: false },
    showExtensions: { type: Boolean, default: true },
    idleText: { type: String, default: "Click or Drag & Drop files" },
    dropText: { type: String, default: "Drop to upload" },
    loadingText: { type: String, default: "Uploading..." },
  })

  const emit = defineEmits(["files-selected"])

  const isDragging = ref(false)
  const fileInput = ref(null)

  const triggerFileDialog = () => fileInput.value?.click()

  function handleDrop(e) {
    isDragging.value = false
    const files = Array.from(e.dataTransfer.files)
    emit("files-selected", files)
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files)
    emit("files-selected", files)
    e.target.value = ""
  }
</script>

<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <GlassCard
      v-bind="hoverProps"
      class="text-center cursor-pointer overflow-hidden border-opacity-10 border-white"
      :class="{
        'elevation-4': isHovering || isDragging,
        'elevation-0': !(isHovering || isDragging),
      }"
      :style="{
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background:
          isHovering || isDragging
            ? 'rgba(255, 255, 255, 0.08) !important'
            : 'rgba(255, 255, 255, 0.03) !important',
        transform: isHovering || isDragging ? 'translateY(-2px)' : 'none',
        pointerEvents: loading ? 'none' : 'auto',
        opacity: loading ? 0.6 : 1,
      }"
      variant="panel"
      padding="pa-0"
      @click="triggerFileDialog"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <v-card-text class="pa-8">
        <v-sheet
          class="mx-auto mb-6 d-flex align-center justify-center"
          :color="
            isHovering || isDragging ? 'white' : 'rgba(255, 255, 255, 0.1)'
          "
          rounded="circle"
          width="80"
          height="80"
          style="transition: all 0.3s ease"
        >
          <v-icon
            :icon="loading ? 'mdi-loading' : 'mdi-cloud-upload'"
            size="40"
            :color="isHovering || isDragging ? 'primary' : 'white'"
            :class="{ rotating: loading }"
          />
        </v-sheet>

        <v-card-title
          class="text-h6 font-weight-bold justify-center pa-0 mb-1 text-white"
          style="transition: color 0.3s ease"
        >
          {{ loading ? loadingText : isDragging ? dropText : idleText }}
        </v-card-title>

        <v-card-subtitle v-if="showExtensions" class="text-body-2 pa-0">
          {{ accept ? `(${accept} files)` : "All files allowed" }}
        </v-card-subtitle>
      </v-card-text>

      <input
        ref="fileInput"
        type="file"
        class="d-none"
        :multiple="multiple"
        :accept="accept"
        @change="handleFileSelect"
      />
    </GlassCard>
  </v-hover>
</template>

<style scoped>
  .rotating {
    animation: rotate 1s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
