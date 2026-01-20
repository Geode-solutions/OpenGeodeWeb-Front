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
        background: isHovering || isDragging ? 'rgba(var(--v-theme-primary), 0.05)' : 'rgba(0, 0, 0, 0.02)',
        border: `2px dashed ${isHovering || isDragging ? 'rgb(var(--v-theme-primary))' : '#e0e0e0'}`,
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
          :style="{
            width: '80px',
            height: '80px',
            transition: 'all 0.3s ease',
          }"
          rounded="circle"
          :elevation="isHovering || isDragging ? 4 : 0"
        >
          <v-icon
            :icon="loading ? 'mdi-loading' : 'mdi-cloud-upload'"
            size="40"
            :color="isHovering || isDragging ? 'white' : 'grey-darken-1'"
            :class="{ rotating: loading }"
          />
        </v-sheet>

        <div
          class="text-h6 font-weight-bold mb-1"
          :class="isHovering || isDragging ? 'text-primary' : 'text-grey-darken-2'"
          style="transition: color 0.3s ease"
        >
          {{
            loading
              ? loadingText
              : isDragging
                ? dropText
                : idleText
          }}
        </div>

        <div v-if="showExtensions" class="text-body-2 text-grey-darken-1">
          {{ accept ? `(${accept} files)` : 'All files allowed' }}
        </div>
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
