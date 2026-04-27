<script setup>
const props = defineProps({
  headers: { type: Array, required: true },
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  xCol: { type: String, default: null },
  yCol: { type: String, default: null },
  zCol: { type: String, default: null },
  separator: { type: String, default: "," },
  skipRows: { type: Number, default: 0 },
});

const getColumnClass = (key) => {
  if (key === props.xCol) return "x-col-highlight";
  if (key === props.yCol) return "y-col-highlight";
  if (key === props.zCol) return "z-col-highlight";
  return "";
};
</script>

<template>
  <div class="d-flex flex-column bg-black-opacity-20 overflow-hidden">
    <div class="pa-4 d-flex align-center border-b border-opacity-10">
      <v-icon icon="mdi-table-eye" size="small" class="mr-2 opacity-60" />
      <span class="text-subtitle-2 font-weight-medium opacity-80">
        Live Preview (First 100 rows)
      </span>
      <v-spacer />
      <v-chip v-if="loading" size="x-small" color="primary" variant="flat">
        <v-progress-circular indeterminate size="12" width="2" class="mr-2" />
        Parsing...
      </v-chip>
    </div>

    <v-data-table
      :key="`${separator}-${skipRows}`"
      :headers="headers"
      :items="rows"
      class="bg-transparent"
      density="compact"
      hover
      hide-default-footer
      :loading="loading"
      fixed-header
      height="100%"
    >
      <template v-for="h in headers" v-slot:[`item.${h.key}`]="{ item }">
        <div :class="getColumnClass(h.key)" class="px-2 py-1 rounded text-truncate">
          {{ item[h.key] }}
        </div>
      </template>

      <template #no-data>
        <div class="d-flex flex-column align-center justify-center h-100 py-12 opacity-40">
          <v-icon size="64" icon="mdi-table-off" />
          <div class="text-h6 mt-2">No preview available</div>
          <div class="text-caption">Check your parser settings</div>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<style scoped>
.bg-black-opacity-20 {
  background: rgba(0, 0, 0, 0.2);
}

:deep(.v-data-table__th) {
  background: #1e1e1e !important; /* Solid background to prevent overlap transparency */
  color: rgba(var(--v-theme-primary), 0.9) !important;
  font-weight: bold !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  min-width: 150px !important;
  white-space: nowrap !important;
}

:deep(.v-data-table__td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.v-data-table__tr:hover td) {
  background: rgba(var(--v-theme-primary), 0.05) !important;
}

.x-col-highlight {
  background: rgba(0, 176, 255, 0.2) !important;
  color: #00b0ff !important;
  font-weight: bold;
}

.y-col-highlight {
  background: rgba(100, 221, 23, 0.2) !important;
  color: #64dd17 !important;
  font-weight: bold;
}

.z-col-highlight {
  background: rgba(255, 23, 68, 0.2) !important;
  color: #ff1744 !important;
  font-weight: bold;
}
</style>
