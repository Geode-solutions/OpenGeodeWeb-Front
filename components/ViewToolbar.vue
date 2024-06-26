<template>
  <v-row dense :class="[$style.floatToolbar, 'flex-column']">
    <v-col>
      <v-btn
        density="comfortable"
        icon
        @click.stop="reset_camera"
        v-tooltip:left="'Reset camera'"
      >
        <v-icon icon="mdi-cube-scan" size="32" />
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
  import schemas from "@geode/opengeodeweb-viewer/schemas.json"

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
