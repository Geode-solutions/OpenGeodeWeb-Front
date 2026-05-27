<script setup>
import { Status } from "@ogw_front/utils/status";
import { useBackStore } from "@ogw_front/stores/back";

const { schema } = defineProps({
  schema: { type: Object, required: true },
});

const backStore = useBackStore();
const packages_versions = ref([]);

async function get_packages_versions() {
  const params = {};
  await backStore.request(
    { schema, params },
    {
      response_function: (response) => {
        packages_versions.value = response.versions;
      },
    },
  );
}

watch(
  () => backStore.status,
  (value) => {
    if (value === Status.CONNECTED) {
      get_packages_versions();
    }
  },
);

await get_packages_versions();
</script>

<template>
  <v-container>
    This tool uses our Open-Source codes
    <v-tooltip location="end">
      <span v-for="package_version in packages_versions" :key="package_version.package">
        {{ package_version.package }} v{{ package_version.version }}
        <br />
      </span>
      <template #activator="{ props }">
        <v-icon v-bind="props" color="primary" class="justify-right">
          mdi-information-outline
        </v-icon>
      </template>
    </v-tooltip>
  </v-container>
</template>
