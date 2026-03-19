<template>
  <Transition name="slide-fade" class="pa-0">
    <v-row align="center" class="pa-0">
      <v-col cols="auto" class="pa-0">
        <v-progress-circular
          :size="22"
          :width="3"
          color="primary"
          indeterminate
        />
      </v-col>
      <v-col cols="auto">
        <p>Fetching data...</p>
      </v-col>
    </v-row>
  </Transition>
</template>
