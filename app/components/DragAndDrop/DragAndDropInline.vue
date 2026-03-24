<script setup>
import GlassCard from "@ogw_front/components/GlassCard";

const {
  isDragging,
  loading,
  texts,
  accept,
  showExtensions,
} = defineProps({
  isDragging: { type: Boolean, required: true },
  loading: { type: Boolean, required: true },
  texts: {
    type: Object,
    default: () => ({
      idle: "Click or drag and drop",
      drop: "Drop files here",
      loading: "Loading...",
    }),
  },
  accept: { type: String, default: "" },
  showExtensions: { type: Boolean, required: true },
});

const emit = defineEmits(["click"]);
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
        :color="isHovering || isDragging ? 'primary' : 'rgba(255,255,255,0.05)'"
        rounded="circle"
        width="64"
        height="64"
      >
        <v-icon
          :icon="loading ? 'mdi-loading' : 'mdi-cloud-upload'"
          size="32"
          :color="isHovering || isDragging ? 'white' : 'primary'"
          :class="{ rotating: loading }"
        />
      </v-sheet>

      <v-card-text class="pa-0">
        <v-sheet class="text-h6 font-weight-bold text-white d-block mb-1 bg-transparent">
          {{ loading ? texts.loading : isDragging ? texts.drop : texts.idle }}
        </v-sheet>
        <v-sheet
          v-if="accept && showExtensions"
          class="text-body-2 text-white opacity-60 bg-transparent"
        >
          {{ accept }}
        </v-sheet>
      </v-card-text>
    </GlassCard>
  </v-hover>
</template>

<style scoped>
.drag-card-inline {
  border: 2px dashed rgba(255, 255, 255, 0.1) !important;
  background: rgba(255, 255, 255, 0.03) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drag-card-inline:hover,
.drag-card-inline.dragging-active {
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  background: rgba(var(--v-theme-primary), 0.05) !important;
}

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
