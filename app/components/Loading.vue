<script setup>
  const { logo } = defineProps({
    logo: {
      type: String,
      required: true,
    },
  })

  const ecoMessages = [
    {
      icon: "mdi-leaf",
      title: "Why the wait?",
      message: "Your workspace starts on demand, no idle servers running 24/7.",
    },
    {
      icon: "mdi-lightning-bolt-outline",
      title: "Lower carbon footprint",
      message:
        "On-demand computing uses up to 70% less energy than always-on servers.",
    },
    {
      icon: "mdi-earth",
      title: "Your choice matters",
      message:
        "By using Vease, you're part of a more sustainable way to work with data.",
    },
  ]

  const currentMessage = ref(0)
  const show = ref(false)
  const progress = ref(0)

  let interval = null

  onMounted(() => {
    show.value = true

    interval = setInterval(() => {
      currentMessage.value = (currentMessage.value + 1) % ecoMessages.length
    }, 3000)
  })

  onUnmounted(() => {
    clearInterval(interval)
  })
</script>
<template>
  <v-overlay
    v-model="show"
    persistent
    class="align-center justify-center"
    style="background: rgba(5, 5, 5, 0.1); backdrop-filter: blur(8px)"
  >
    <v-sheet
      position="fixed"
      location="center"
      height="100vh"
      width="100vw"
      color="transparent"
      class="bg-grid-pattern"
      style="z-index: -1"
    />

    <v-container class="text-center" style="max-width: 650px">
      <v-row justify="center" class="mb-8">
        <v-img
          :src="logo"
          height="180"
          width="180"
          style="
            filter: drop-shadow(0 0 20px rgba(var(--v-theme-primary), 0.4));
          "
        />
      </v-row>

      <v-card color="transparent" elevation="0" class="mb-8 overflow-visible">
        <v-card-title
          class="text-h2 font-weight-black text-white text-wrap pa-0 d-block"
          style="text-shadow: 0 0 20px rgba(255, 255, 255, 0.3)"
        >
          STARTING UP
        </v-card-title>
        <v-divider
          thickness="3"
          class="border-opacity-100 mx-auto my-4"
          color="primary"
          width="60"
        />
        <v-card-subtitle
          class="text-subtitle-2 font-weight-bold text-white ls-widest pa-0 text-wrap"
          style="opacity: 0.9"
        >
          YOUR WORKSPACE IS WAKING UP...
        </v-card-subtitle>
      </v-card>

      <v-sheet
        color="transparent"
        height="160"
        class="position-relative overflow-visible mb-4"
      >
        <v-scroll-y-reverse-transition mode="out-in">
          <v-card
            :key="currentMessage"
            rounded="lg"
            class="pa-6 border mx-auto"
            color="rgba(255, 255, 255, 0.05)"
            elevation="0"
            style="border-color: rgba(255, 255, 255, 0.1) !important"
          >
            <v-card-title
              class="d-flex align-center ga-3 pa-0 mb-3 text-subtitle-1 font-weight-bold text-white text-wrap"
            >
              <v-icon
                :icon="ecoMessages[currentMessage].icon"
                color="white"
                size="22"
                style="
                  filter: drop-shadow(
                    0 0 6px rgba(var(--v-theme-primary), 0.6)
                  );
                "
              />
              {{ ecoMessages[currentMessage].title }}
            </v-card-title>
            <v-card-text
              class="pa-0 text-body-2 text-white text-left"
              style="opacity: 0.85; line-height: 1.7"
            >
              {{ ecoMessages[currentMessage].message }}
            </v-card-text>
          </v-card>
        </v-scroll-y-reverse-transition>

        <v-row justify="center" class="ga-3 mt-6">
          <v-icon
            v-for="(_, index) in ecoMessages"
            :key="index"
            size="10"
            :color="index <= currentMessage ? 'white' : 'white'"
            :icon="
              index === currentMessage ? 'mdi-circle' : 'mdi-circle-outline'
            "
            :style="{ opacity: index <= currentMessage ? 1 : 0.25 }"
          />
        </v-row>
      </v-sheet>

      <v-sheet
        color="transparent"
        class="position-relative overflow-visible pt-8"
      >
        <v-progress-linear
          indeterminate
          v-model="progress"
          color="white"
          height="8"
          rounded
          style="background: rgba(255, 255, 255, 0.1)"
        >
          <template v-slot:default="{ value }">
            <v-sheet
              color="transparent"
              class="d-flex justify-end position-absolute h-100"
              :style="{
                width: value + '%',
                left: 0,
                transition: 'width 0.15s linear',
              }"
            >
              <v-chip
                color="white"
                size="small"
                variant="flat"
                class="position-absolute font-weight-black"
                style="
                  top: -40px;
                  right: -20px;
                  box-shadow: 0 0 12px rgba(var(--v-theme-primary), 0.6);
                "
              >
                {{ Math.round(value) }}%
              </v-chip>
            </v-sheet>
          </template>
        </v-progress-linear>
      </v-sheet>

      <v-card
        color="transparent"
        elevation="0"
        class="mt-8 d-flex align-center justify-center ga-2 text-white"
        style="opacity: 0.6; letter-spacing: 0.08em"
      >
        <v-icon icon="mdi-leaf" size="14" />
        <v-card-text
          class="pa-0 text-caption font-weight-medium"
          style="flex: none"
        >
          On-demand infrastructure greener by design
        </v-card-text>
      </v-card>
    </v-container>
  </v-overlay>
</template>

<style scoped>
  .bg-grid-pattern {
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.08) 1px,
      transparent 0
    );
    background-size: 40px 40px;
    background-position: center;
  }

  .ls-widest {
    letter-spacing: 0.6em !important;
  }
</style>
