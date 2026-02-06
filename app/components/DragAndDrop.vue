<script setup>
  const {
    multiple,
    accept,
    loading,
    showExtensions,
    idleText,
    dropText,
    loadingText,
  } = defineProps({
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

  function triggerFileDialog() {
    fileInput.value?.click()
  }

  function handleDrop(event) {
    isDragging.value = false
    const files = [...event.dataTransfer.files]
    emit("files-selected", files)
  }

  function handleFileSelect(event) {
    const files = [...event.target.files]
    emit("files-selected", files)
    event.target.value = ""
  }
</script>

<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <v-card
      v-bind="hoverProps"
      class="text-center cursor-pointer"
      :class="{
        'elevation-4': isHovering || isDragging,
        'elevation-0': !(isHovering || isDragging),
      }"
      :style="{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        background:
          isHovering || isDragging
            ? 'rgba(var(--v-theme-primary), 0.05)'
            : 'rgba(0, 0, 0, 0.02)',
        border: `2px dashed ${
          isHovering || isDragging ? 'rgb(var(--v-theme-primary))' : '#e0e0e0'
        }`,
        transform: isHovering || isDragging ? 'translateY(-2px)' : 'none',
        pointerEvents: loading ? 'none' : 'auto',
        opacity: loading ? 0.6 : 1,
      }"
      rounded="xl"
      @click="triggerFileDialog"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <v-card-text class="pa-8">
        <v-sheet
          class="mx-auto mb-6 d-flex align-center justify-center"
          :color="isHovering || isDragging ? 'primary' : 'grey-lighten-2'"
          :elevation="isHovering || isDragging ? 4 : 0"
          rounded="circle"
          width="80"
          height="80"
          style="transition: all 0.3s ease"
        >
          <v-icon
            :icon="loading ? 'mdi-loading' : 'mdi-cloud-upload'"
            size="40"
            :color="isHovering || isDragging ? 'white' : 'grey-darken-1'"
            :class="{ rotating: loading }"
          />
        </v-sheet>

        <v-card-title
          class="text-h6 font-weight-bold justify-center pa-0 mb-1"
          :class="
            isHovering || isDragging ? 'text-primary' : 'text-grey-darken-2'
          "
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
    </v-card>
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
