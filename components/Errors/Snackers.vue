<template>
  <v-snackbar :style="{ 'margin-bottom': calc_margin(index) }" v-for="(error, index) in errors" :key="index"
    v-model="show" color="error" location="bottom right" transition="slide-x-reverse-transition" max-width="30%"
    height="20px">
    <v-row dense class="flex-nowrap">
      <v-col cols="auto">
        <v-tooltip location="left">
          <span>
            {{ error.code }}<br />
            {{ error.route }}<br />
            {{ error.description }}
            <br>
          </span>
          <template #activator="{ props }">
            <v-icon v-bind="props" color="white" class="justify-right">
              mdi-information-outline
            </v-icon>
          </template>
        </v-tooltip>
      </v-col>
      <v-col cols="9" class="text-no-wrap overflow-hidden">
        {{ error.name }}
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn icon flat size="20" @click="errors_store.delete_error(index)" color="error">
          <v-icon icon="mdi-close" size="20" color="white" />
        </v-btn>
      </v-col>
    </v-row>
  </v-snackbar>
</template>

<script setup>
const errors_store = use_errors_store()
const { errors } = storeToRefs(errors_store)

const show = true

function calc_margin (index) {
  return (index * 60) + 8 + 'px'
}
</script>

<style scoped>
.v-snackbar :deep(.v-snackbar__content) {
  width: 100%;
}
</style>