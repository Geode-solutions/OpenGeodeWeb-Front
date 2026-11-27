<script setup lang="ts">
import type { AcceptRule } from "@ogw_front/utils/drag_and_drop";
import type { DragAndDropTexts } from "@ogw_front/types/props/components_files";
import GlassCard from "@ogw_front/components/GlassCard.vue";

interface Props {
  isDragging: boolean;
  loading: boolean;
  texts: DragAndDropTexts;
  accept: AcceptRule | AcceptRule[];
  showExtensions: boolean;
}

interface Emits {
  click: [];
}

const { isDragging, loading, texts, accept, showExtensions } = defineProps<Props>();

const emit = defineEmits<Emits>();
</script>

<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <GlassCard
      v-bind="hoverProps"
      class="drag-card-inline text-center cursor-pointer transition-swing"
      :class="{ 'dragging-active': isDragging, 'elevation-8': isHovering }"
      variant="ui"
      @click="emit('click')"
    >
      <v-sheet
        class="mx-auto mb-4 d-flex align-center justify-center transition-swing"
        :color="isHovering || isDragging ? 'primary' : 'rgba(var(--v-theme-on-surface), 0.05)'"
        rounded="circle"
        width="64"
        height="64"
      >
        <v-icon
          :icon="loading ? 'ph-circle-notch' : 'ph-cloud-arrow-up'"
          size="32"
          :color="isHovering || isDragging ? 'rgb(var(--v-theme-on-primary))' : 'primary'"
          :class="{ rotating: loading }"
        />
      </v-sheet>

      <v-card-text class="pa-0">
        <v-sheet
          class="text-headline-small font-weight-bold text-high-emphasis d-block mb-1 bg-transparent"
        >
          {{ loading ? texts.loading : isDragging ? texts.drop : texts.idle }}
        </v-sheet>
        <v-sheet
          v-if="accept && showExtensions"
          class="text-body-medium text-high-emphasis opacity-60 bg-transparent"
        >
          {{ Array.isArray(accept) ? accept.join(", ") : accept }}
        </v-sheet>
      </v-card-text>
    </GlassCard>
  </v-hover>
</template>

<style scoped>
.drag-card-inline {
  border: 2px dashed rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  background: rgba(var(--v-theme-on-surface), 0.04) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drag-card-inline:hover,
.drag-card-inline.dragging-active {
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  background: rgba(var(--v-theme-primary), 0.05) !important;
}
</style>
