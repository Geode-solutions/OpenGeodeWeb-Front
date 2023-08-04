<template>
  <v-banner v-if="server_error" elevation="2" style="background-color: grey; z-index:100;" position="fixed">
    <v-row>
      <v-col cols="auto" class="white--text text-center">
        <v-tooltip location="end">
          <span>
            We turn off our server automatically after 5 minutes of inactivity
          </span>
          <template #activator="{ props }">
            <v-icon v-bind="props" color="white" class="justify-right">
              mdi-information-outline
            </v-icon>
          </template>
        </v-tooltip>
      </v-col>
      <v-col cols="auto" class="text-white font-weight-bold">Server timed out due to inactivity,
        please reload this page
        or click here:
      </v-col>
      <v-col cols="auto" align-items="center">
        <v-btn @click="reload()" color="grey" density='compact'>
          Reload
        </v-btn>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn icon flat size="20" @click="errors_store.delete_server_error()" color="grey" class=".align-center">
          <v-icon icon="mdi-close" size="20" color="white" />
        </v-btn>
      </v-col>
    </v-row>
  </v-banner>
</template>

<script setup>
const errors_store = use_errors_store()
const { server_error } = storeToRefs(errors_store)

function reload () {
  window.location.reload()
}
</script>

<style scoped>
.v-btn {
  text-transform: unset !important;
}
</style>