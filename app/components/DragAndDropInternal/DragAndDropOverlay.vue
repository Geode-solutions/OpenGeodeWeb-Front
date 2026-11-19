<script setup lang="ts">
import ChromeTheme from "@ogw_front/components/ChromeTheme.vue";

interface DragAndDropTexts {
  idle: string;
  drop: string;
  loading: string;
}

interface Props {
  isDragging: boolean;
  showOverlay: boolean;
  fullscreen: boolean;
  loading: boolean;
  texts?: DragAndDropTexts;
  multiple: boolean;
  accept?: string | string[];
  showExtensions: boolean;
}

const {
  isDragging,
  showOverlay,
  fullscreen,
  loading,
  texts = {
    idle: "Click or drag and drop",
    drop: "Drop files here",
    loading: "Loading...",
  },
  multiple,
  accept = "",
  showExtensions,
} = defineProps<Props>();
</script>

<template>
  <Teleport to="body">
    <ChromeTheme>
      <v-fade-transition>
        <v-overlay
          v-if="isDragging && showOverlay"
          :model-value="true"
          :scrim="false"
          class="drag-overlay"
          content-class="w-100 h-100"
          persistent
        >
          <v-container class="fill-height d-flex align-center justify-center" :fluid="fullscreen">
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
                  <v-icon icon="ph-cloud-arrow-up" :size="fullscreen ? 80 : 64" />
                </v-sheet>

                <v-sheet
                  class="font-weight-black mb-6 text-high-emphasis text-glow d-block bg-transparent"
                  :class="fullscreen ? 'text-display-medium' : 'text-display-small'"
                >
                  {{
                    loading
                      ? texts.loading
                      : fullscreen
                        ? "Drop your files here"
                        : "Drop your files"
                  }}
                </v-sheet>

                <v-sheet
                  class="text-high-emphasis opacity-70 d-block mb-8 mx-auto bg-transparent"
                  :class="fullscreen ? 'text-headline-medium' : 'text-headline-small'"
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
                  variant="outlined"
                  :size="fullscreen ? 'x-large' : 'large'"
                  class="px-8 glow-chip"
                >
                  Accepted formats: {{ Array.isArray(accept) ? accept.join(", ") : accept }}
                </v-chip>

                <v-sheet
                  class="text-high-emphasis opacity-40 d-block mt-12 bg-transparent"
                  :class="fullscreen ? 'text-headline-small' : 'text-body-medium'"
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
    </ChromeTheme>
  </Teleport>
</template>

<style scoped>
.drag-overlay :deep(.v-overlay__content) {
  background: var(--ogw-dropzone-bg, rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(24px);
}

.drag-frame-border {
  position: absolute;
  inset: 32px;
  border: 4px dashed rgba(var(--v-theme-on-surface), 0.3);
  border-radius: 32px;
  pointer-events: none;
  animation: border-glimmer 4s infinite ease-in-out;
}

.glow-chip {
  background: rgba(var(--v-theme-on-surface), 0.08) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.4) !important;
}

.escape-kbd {
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.2);
  font-weight: bold;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.4);
}

.text-glow {
  text-shadow: var(--ogw-dropzone-text-shadow, 0 0 30px rgba(255, 255, 255, 0.3));
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
    border-color: rgba(var(--v-theme-on-surface), 0.2);
  }
  50% {
    border-color: rgba(var(--v-theme-primary), 0.4);
  }
}
</style>
