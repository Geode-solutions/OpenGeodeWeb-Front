export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:created", (vueApp) => {
    const vuetify = vueApp.config.globalProperties.$vuetify;
    if (!vuetify?.defaults) return;

    vuetify.defaults.value = {
      ...vuetify.defaults.value,
      VTooltip: {
        ...(vuetify.defaults.value?.VTooltip ?? {}),
        openDelay: 500,
      },
    };
  });
});
