<script setup lang="ts">
import ActionButton from "@ogw_front/components/ActionButton.vue";
import SearchBar from "@ogw_front/components/SearchBar.vue";

interface Props {
  search: string;
  sortType: string;
  filterOptions: Record<string, boolean>;
  availableFilterOptions: string[];
  isCollapsed?: boolean;
}

const {
  search,
  sortType,
  filterOptions,
  availableFilterOptions,
  isCollapsed = false,
} = defineProps<Props>();

interface Emits {
  "update:search": [value: string];
  "toggle-sort": [];
  "collapse-all": [];
  "expand-all": [];
}

const emit = defineEmits<Emits>();

const showSearch = ref<boolean>(false);

watch(
  () => showSearch.value,
  (val) => {
    if (!val) {
      emit("update:search", "");
    }
  },
);
</script>

<template>
  <v-row density="compact" align="center" class="controls-row pa-1 py-0">
    <v-col cols="12">
      <div
        class="controls-capsule d-flex align-center rounded-pill overflow-hidden"
        :class="{ 'is-expanded': showSearch }"
      >
        <ActionButton
          data-testid="searchObjectsButton"
          :tooltip="showSearch ? 'Hide search' : 'Show search'"
          icon="ph-magnifying-glass"
          tooltipLocation="bottom"
          variant="text"
          @click="showSearch = !showSearch"
        />

        <v-expand-x-transition>
          <div v-if="showSearch" class="flex-grow-1 ms-1 text-no-wrap overflow-hidden">
            <SearchBar
              data-testid="searchObjectsInput"
              :model-value="search"
              placeholder="Search objects..."
              variant="plain"
              density="compact"
              prepend-inner-icon=""
              autofocus
              @update:model-value="emit('update:search', $event)"
            />
          </div>
        </v-expand-x-transition>

        <div class="d-flex align-center">
          <v-fade-transition>
            <v-divider
              v-if="!showSearch"
              vertical
              inset
              class="mx-1 align-self-center"
              style="height: 20px"
            />
          </v-fade-transition>
          <ActionButton
            data-testid="sortObjectsButton"
            :tooltip="'Sort by ' + (sortType === 'name' ? 'ID' : 'Name')"
            :icon="sortType === 'name' ? 'ph-sort-ascending' : 'ph-list-numbers'"
            variant="text"
            tooltipLocation="bottom"
            @click="emit('toggle-sort')"
          />
          <v-menu :close-on-content-click="false">
            <template #activator="{ props: menuProps }">
              <ActionButton
                data-testid="filterObjectsButton"
                tooltip="Filter options"
                icon="ph-funnel-simple"
                variant="text"
                tooltipLocation="bottom"
                v-bind="menuProps"
              />
            </template>
            <v-list class="mt-1">
              <v-list-item v-for="category_id in availableFilterOptions" :key="category_id">
                <v-checkbox
                  v-model="filterOptions[category_id]"
                  :label="category_id"
                  hide-details
                  density="compact"
                  :data-testid="'filterCheckbox-' + category_id"
                />
              </v-list-item>
            </v-list>
          </v-menu>
          <ActionButton
            data-testid="CollapseOrExpandAll"
            :tooltip="isCollapsed ? 'Expand All' : 'Collapse All'"
            :icon="isCollapsed ? 'ph-arrows-out-line-vertical' : 'ph-arrows-in-line-vertical'"
            variant="text"
            tooltipLocation="bottom"
            @click="isCollapsed ? emit('expand-all') : emit('collapse-all')"
          />
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<style scoped>
/* Apps can line the first icon up with the panel header icon (fallbacks: the former look) */
.controls-row {
  padding-left: var(--ogw-viewer-controls-inset, 4px) !important;
}

.controls-capsule {
  height: 32px;
  padding-inline: var(--ogw-viewer-controls-padding, 4px);
  border: 1px solid transparent;
  transition: all 0.3s ease;
  width: fit-content;
}

.controls-capsule.is-expanded {
  width: 100%;
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.controls-capsule:hover:not(.is-expanded) {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

:deep(.v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 32px !important;
  display: flex;
  align-items: center;
}

.controls-capsule :deep(.v-btn .v-icon) {
  font-size: var(--ogw-viewer-controls-icon-size, 28px) !important;
  width: var(--ogw-viewer-controls-icon-size, 28px) !important;
  height: var(--ogw-viewer-controls-icon-size, 28px) !important;
}

:deep(.v-field__field) {
  height: 32px !important;
}
</style>
