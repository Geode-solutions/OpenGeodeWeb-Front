<template>
  <ContextMenuItem
    :itemProps="props.itemProps"
    tooltip="Points options"
    :btn_image="SurfacePoints"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch v-model="visibility" />
      <template v-if="visibility">
        <v-row class="pa-0" align="center">
          <v-divider />
          <v-col cols="auto" justify="center">
            <v-icon size="30" icon="mdi-ruler" v-tooltip:left="'Size'" />
          </v-col>
          <v-col justify="center">
            <v-slider
              v-model="size"
              hide-details
              min="0"
              max="20"
              step="2"
              thumb-color="black"
              ticks
            />
          </v-col>
        </v-row>
      </template>
    </template>
  </ContextMenuItem>
</template>

<script setup>
  import SurfacePoints from "@ogw_f/assets/viewer_svgs/surface_points.svg"

  const dataStyleStore = useDataStyleStore()

  const props = defineProps({
    itemProps: { type: Object, required: true },
    btn_image: { type: String, required: true },
  })

  const id = toRef(() => props.itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.modelPointsVisibility(id.value),
    set: (newValue) =>
      dataStyleStore.setModelPointsVisibility(id.value, newValue),
  })
  const size = computed({
    get: () => dataStyleStore.modelPointsSize(id.value),
    set: (newValue) => dataStyleStore.setModelPointsSize(id.value, newValue),
  })
</script>
