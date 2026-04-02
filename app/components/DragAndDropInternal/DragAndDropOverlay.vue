<script setup>
const { isDragging, showOverlay, fullscreen, loading, texts, multiple, accept, showExtensions } =
  defineProps({
    isDragging: { type: Boolean, required: true },
    showOverlay: { type: Boolean, required: true },
    fullscreen: { type: Boolean, required: true },
    loading: { type: Boolean, required: true },
    texts: {
      type: Object,
      default: () => ({
        idle: "Click or drag and drop",
        drop: "Drop files here",
        loading: "Loading...",
      }),
    },
    multiple: { type: Boolean, required: true },
    accept: { type: String, default: "" },
    showExtensions: { type: Boolean, required: true },
  });
</script>

<template>
  <Teleport to="body">
    <v-fade-transition>
      <v-overlay
        v-if="isDragging && showOverlay"
        :model-value="true"
        :scrim="false"
        class="drag-overlay"
        content-class="w-100 h-100"
        persistent
      >
        <v-container class="fill-height" :fluid="fullscreen">
          <v-row align="center" justify="center">
            <v-col
              cols="12"
              :md="fullscreen ? 12 : 8"
              :lg="fullscreen ? 12 : 6"
              class="text-center"
            >
              <v-sheet
                class="mx-auto mb-8 pulse-animation d-flex align-center justify-center"
                color="primary"
                rounded="circle"
                :width="fullscreen ? 140 : 120"
                :height="fullscreen ? 140 : 120"
              >
                <v-icon icon="mdi-cloud-upload" :size="fullscreen ? 80 : 64" color="white" />
              </v-sheet>

              <v-sheet
                class="font-weight-black mb-6 text-white text-glow d-block bg-transparent"
                :class="fullscreen ? 'text-h2' : 'text-h3'"
              >
                {{
                  loading ? texts.loading : fullscreen ? "Drop your files here" : "Drop your files"
                }}
              </v-sheet>

              <v-sheet
                class="text-white opacity-70 d-block mb-8 mx-auto bg-transparent"
                :class="fullscreen ? 'text-h5' : 'text-h6'"
                :style="fullscreen ? 'max-width:700px' : 'max-width:500px'"
              >
                {{
                  multiple
                    ? "Drag your files anywhere on the screen to import them."
                    : "Drag your file anywhere on the screen to import it."
                }}
              </v-sheet>

              <v-chip
                v-if="accept && showExtensions"
                color="white"
                variant="outlined"
                :size="fullscreen ? 'x-large' : 'large'"
                class="px-8 glow-chip"
              >
                Accepted formats: {{ accept }}
              </v-chip>

              <v-sheet
                class="text-white opacity-40 d-block mt-12 bg-transparent"
                :class="fullscreen ? 'text-h6' : 'text-body-2'"
              >
                Press
                <v-kbd class="escape-kbd mx-1">Esc</v-kbd>
                to cancel
              </v-sheet>
            </v-col>
          </v-row>
        </v-container>

        <v-sheet v-if="fullscreen" class="drag-frame-border" color="transparent" />
      </v-overlay>
    </v-fade-transition>
  </Teleport>
</template>

<style scoped>
.drag-overlay :deep(.v-overlay__content) {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(24px);
}

.drag-frame-border {
  position: absolute;
  inset: 32px;
  border: 4px dashed rgba(255, 255, 255, 0.3);
  border-radius: 32px;
  pointer-events: none;
  animation: border-glimmer 4s infinite ease-in-out;
}

.glow-chip {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.escape-kbd {
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.text-glow {
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0px rgba(var(--v-theme-primary), 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(var(--v-theme-primary), 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0px rgba(var(--v-theme-primary), 0);
  }
}

@keyframes border-glimmer {
  0%,
  100% {
    border-color: rgba(255, 255, 255, 0.2);
  }
  50% {
    border-color: rgba(var(--v-theme-primary), 0.4);
  }
}
</style>
