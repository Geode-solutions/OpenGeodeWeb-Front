<script setup>
import ActionButton from "@ogw_front/components/ActionButton.vue";
import SearchBar from "@ogw_front/components/SearchBar.vue";

const { search, sortType, filterOptions, availableFilterOptions } = defineProps({
  search: { type: String, required: true },
  sortType: { type: String, required: true },
  filterOptions: { type: Object, required: true },
  availableFilterOptions: { type: Array, required: true },
});

const emit = defineEmits(["update:search", "toggle-sort"]);
</script>

<template>
  <v-row dense align="center" class="pa-2">
    <v-col>
      <SearchBar
        :model-value="search"
        label="Search"
        color="black"
        base-color="black"
        @update:model-value="emit('update:search', $event)"
      />
    </v-col>
    <v-col cols="auto" class="d-flex align-center">
      <ActionButton
        :tooltip="'Sort by ' + (sortType === 'name' ? 'ID' : 'Name')"
        :icon="
          sortType === 'name' ? 'mdi-sort-alphabetical-ascending' : 'mdi-sort-numeric-ascending'
        "
        tooltipLocation="bottom"
        @click="emit('toggle-sort')"
      />
      <v-menu :close-on-content-click="false">
        <template #activator="{ props: menuProps }">
          <ActionButton
            tooltip="Filter options"
            icon="mdi-filter-variant"
            tooltipLocation="bottom"
            class="ml-1"
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
    </v-col>
  </v-row>
</template>
