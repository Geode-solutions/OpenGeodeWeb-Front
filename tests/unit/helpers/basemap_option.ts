// The basemap is an opt-in of the app (`ogwFront.basemap` in its app.config.ts)
function setBasemapOption(enabled: boolean): void {
  // The resolved app config type holds the layer's literal default
  Object.assign(useAppConfig().ogwFront, { basemap: enabled });
}

export { setBasemapOption };
