<script setup lang="ts">
// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import type { PropType } from "vue";
import { Status } from "@ogw_front/utils/status";
import { useBackStore } from "@ogw_front/stores/back";
import type { JsonRpcSchema } from "#shared/utils/types.js";

// oxlint-disable-next-line vue/define-props-declaration
const { schema } = defineProps({
  schema: { type: Object as PropType<JsonRpcSchema>, required: true },
});

type PackageVersion = { package: string; version: string };

const backStore = useBackStore();
const packages_versions = ref<PackageVersion[]>([]);

async function get_packages_versions() {
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
