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
}
export default { appMode, getAppMode }
