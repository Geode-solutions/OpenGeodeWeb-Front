<template>
  <v-container>
    <h1 class="text-h2 py-2" align="center">
      {{ tool_name }}
    </h1>
    <v-col>
      <v-row class="justify-center">
        <v-col v-for="(card, i) in cards_list" :key="i" cols="11" md="5">
          <v-card class="card" hover :href="card.href" rounded target="_blank">
            <v-card-title
              primary-title
              class="justify-center text-h6"
              align="center"
            >
              {{ card.title }}
            </v-card-title>
            <v-row class="justify-center pa-2">
              <v-col cols="auto">
                <v-icon
                  :icon="card.icon"
                  color="primary"
                  size="70"
                  class="justify-center"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script setup>
  const props = defineProps({
    tool_name: { type: String, required: true },
    cards_list: { type: Object, required: true },
  })
</script>
