<template>
  <v-snackbar
    v-for="(feedback, index) in feedback_store.feedbacks"
    :key="feedback"
    v-model="show"
    :style="{ 'margin-bottom': calc_margin(index) }"
    :color="feedback.type"
    location="bottom right"
    transition="slide-x-reverse-transition"
    max-width="200px"
    height="20px"
    timeout="10000"
  >
    <v-row dense class="flex-nowrap">
      <v-col cols="auto">
        <v-tooltip v-if="feedback.type === 'error'" location="left">
          <span>
            error: {{ feedback.code }} {{ feedback.name }}<br />
            ressource: {{ feedback.route }}
            <br />
          </span>
          <template #activator="{ props }">
            <v-icon v-bind="props" color="white" class="justify-right">
              mdi-information-outline
            </v-icon>
          </template>
        </v-tooltip>
        <v-tooltip v-else-if="feedback.type === 'success'" location="left">
          <v-icon color="white" class="justify-right">
            mdi-check-circle-outline
          </v-icon>
        </v-tooltip>
      </v-col>
      <v-col cols="9" class="text-no-wrap overflow-hidden">
        <v-tooltip location="top">
          <span>
            {{ feedback.description }}
            <br />
          </span>
          <template #activator="{ props }">
            <div v-bind="props">
              {{ feedback.description }}
            </div>
          </template>
        </v-tooltip>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn
          icon
          variant="flat"
          size="20"
          :color="feedback.type"
          @click="feedback_store.delete_feedback(index)"
        >
          <v-icon icon="mdi-close" size="20" color="white" />
        </v-btn>
      </v-col>
    </v-row>
  </v-snackbar>
</template>

<script setup>
  const feedback_store = use_feedback_store()
  const show = true

  function calc_margin(index) {
    return index * 60 + 8 + "px"
  }
</script>

<style scoped>
  .v-snackbar :deep(.v-snackbar__content) {
    width: 100%;
  }
</style>
