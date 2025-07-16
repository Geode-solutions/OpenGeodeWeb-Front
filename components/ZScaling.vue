<template>
  <v-sheet :width="width + 'px'" class="z-scaling-menu" border="md">
    <v-card class="bg-primary pa-0">
      <v-card-title>
        <h3 class="mt-4">Z Scaling Control</h3>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-container>
          <v-row>
            <v-col cols="12" class="py-0">
              <v-slider
                v-model="zScale"
                :min="0.1"
                :max="10"
                :step="0.2"
                label="Z Scale"
                thumb-label
              ></v-slider>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="py-0">
              <v-text-field
                v-model="zScale"
                type="number"
                label="Z Scale Value"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions justify-center>
        <v-btn
          variant="outlined"
          color="white"
          text
          @click="emit('close')"
          class="ml-8 mb-4"
        >
          Close
        </v-btn>
        <v-btn
          variant="outlined"
          class="mb-4"
          color="white"
          text
          @click="updateZScaling"
        >
          Apply
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-sheet>
</template>

<script setup>
  import viewer_schemas from "@geode/opengeodeweb-viewer/schemas.json"

  const emit = defineEmits(["close"])

  const props = defineProps({
    width: { type: Number, required: false, default: 400 },
  })

  const zScale = ref(1.0)

  async function updateZScaling() {
    const schema = viewer_schemas?.opengeodeweb_viewer?.viewer?.set_z_scaling
    console.log("schema", schema, "z_scale", zScale.value)
    await viewer_call({
      schema,
      params: {
        z_scale: zScale.value,
      },
    })

    emit("close")
  }
</script>

<style scoped>
  .z-scaling-menu {
    position: absolute;
    z-index: 2;
    top: 90px;
    right: 55px;
  }
</style>
