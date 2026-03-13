<script setup>
  import InspectorResultPanel from "@ogw_front/components/Inspector/ResultPanel"

  const { inspection_result } = defineProps({
    inspection_result: { type: Array, required: true },
  })
  const opened_panels = ref([])

  onMounted(() => {
    opened_panels.value = inspection_result
      .map((result, i) => (result.nb_issues > 0 ? i : -1))
      .filter((index) => index !== -1)
  })
</script>

<template>
  <v-container class="pa-2">
    <v-expansion-panels v-model="opened_panels" multiple elevation="5">
      <v-expansion-panel
        v-for="(result, index) in inspection_result"
        :key="index"
        class="card"
      >
        <v-expansion-panel-title>
          <v-row align="center">
            <v-col cols="auto">
              <v-icon v-if="result.nb_issues == 0" color="primary" size="25">
                mdi-check-circle-outline
              </v-icon>
              <v-icon v-else color="error" size="25"> mdi-close-circle </v-icon>
            </v-col>
            <v-col>
              {{ result.title }}
            </v-col>
          </v-row>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <InspectorResultPanel
            v-if="result.children"
            :inspection_result="result.children"
          />
          <v-container v-if="result.issues">
            <v-col>
              <v-row
                v-for="(issue, index) in result.issues"
                :key="index"
                class="pa-0"
              >
                {{ issue }}
              </v-row>
            </v-col>
          </v-container>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>
