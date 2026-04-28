<script setup>
import ActionButton from "@ogw_front/components/ActionButton.vue";
import SearchBar from "@ogw_front/components/SearchBar.vue";

const { search, sortType, filterOptions, availableFilterOptions } = defineProps({
  search: { type: String, required: true },
  sortType: { type: String, required: true },
  filterOptions: { type: Object, required: true },
  availableFilterOptions: { type: Array, required: true },
});

const emit = defineEmits(["update:search", "toggle-sort", "collapse-all"]);

const showSearch = ref(false);

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
  <v-row dense align="center" class="pa-2 py-1">
    <v-col cols="12">
      <div
        class="controls-capsule d-flex align-center rounded-pill px-1 overflow-hidden"
        :class="{ 'is-expanded': showSearch }"
      >
        <ActionButton
          :tooltip="showSearch ? 'Hide search' : 'Show search'"
          icon="mdi-magnify"
          tooltipLocation="bottom"
          variant="text"
          color="black"
          @click="showSearch = !showSearch"
        />

        <v-expand-x-transition>
          <div v-if="showSearch" class="flex-grow-1 ms-1 text-no-wrap overflow-hidden">
            <SearchBar
              :model-value="search"
              placeholder="Search objects..."
              color="black"
              base-color="black"
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
            :tooltip="'Sort by ' + (sortType === 'name' ? 'ID' : 'Name')"
            :icon="
              sortType === 'name' ? 'mdi-sort-alphabetical-ascending' : 'mdi-sort-numeric-ascending'
            "
            variant="text"
            color="black"
            tooltipLocation="bottom"
            @click="emit('toggle-sort')"
          />
          <v-menu :close-on-content-click="false">
            <template #activator="{ props: menuProps }">
              <ActionButton
                tooltip="Filter options"
                icon="mdi-filter-variant"
                variant="text"
                color="black"
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
                />
              </v-list-item>
            </v-list>
          </v-menu>
          <ActionButton
            tooltip="Collapse All"
            icon="mdi-collapse-all-outline"
            variant="text"
            color="black"
            tooltipLocation="bottom"
            @click="emit('collapse-all')"
          />
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<style scoped>
.controls-capsule {
  height: 40px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  width: fit-content;
}

.controls-capsule.is-expanded {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.controls-capsule:hover:not(.is-expanded) {
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

:deep(.v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 40px !important;
  display: flex;
  align-items: center;
}

:deep(.v-field__field) {
  height: 40px !important;
}
</style>
