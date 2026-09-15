<script setup lang="ts">
import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import { Status } from "@ogw_front/utils/status";
import { useBackStore } from "@ogw_front/stores/back";

interface Props {
  schema: JsonRpcSchema;
}

const { schema } = defineProps<Props>();

interface PackageVersion {
  package: string;
  version: string;
}

const backStore = useBackStore();
const packages_versions = ref<PackageVersion[]>([]);

async function get_packages_versions(): Promise<void> {
  await backStore.request(
    { schema },
    {
      response_function: (response: unknown) => {
        packages_versions.value = (response as { versions: PackageVersion[] }).versions;
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
// oxlint-disable-next-line no-top-level-await
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
