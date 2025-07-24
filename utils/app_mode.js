import isElectron from "is-electron"

export const appMode = {
  DESKTOP: "DESKTOP",
  BROWSER: "BROWSER",
  CLOUD: "CLOUD",
}

export function getAppMode() {
  if (isElectron()) {
    return appMode.DESKTOP
  }
  if (process.env.BROWSER === true) {
    return appMode.BROWSER
  }
  return appMode.CLOUD
}
export default { appMode, getAppMode }
