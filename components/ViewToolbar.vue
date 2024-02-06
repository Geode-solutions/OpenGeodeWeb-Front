<template>
  <v-row dense :class="[$style.floatToolbar, 'flex-column']">
    <v-col>
      <v-tooltip location="left">
        Reset camera
        <template #activator="{ props }">
          <v-btn
            density="comfortable"
            v-bind="props"
            icon
            @click.stop="reset_camera"
          >
            <v-icon size="32"> mdi-cube-scan </v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script setup>
  import schemas from "@/utils/schemas.json"

  function reset_camera() {
    viewer_call({
      schema: schemas.opengeodeweb_viewer.reset_camera,
    })
  }
</script>

<style module>
  .floatToolbar {
    position: absolute;
    z-index: 2;
    right: 20px;
    top: 20px;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 16px;
  }
</style>
