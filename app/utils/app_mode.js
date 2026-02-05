import isElectron from "is-electron"

const appMode = {
  DESKTOP: "DESKTOP",
  BROWSER: "BROWSER",
  CLOUD: "CLOUD",
}

function getAppMode() {
  if (isElectron()) {
    return appMode.DESKTOP
  }
  if (useRuntimeConfig().public.BROWSER === "true") {
    return appMode.BROWSER
  }
  return appMode.CLOUD
}

const app_mode_utils = { appMode, getAppMode }

export { appMode, getAppMode }
export default app_mode_utils
