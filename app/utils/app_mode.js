const appMode = {
  DESKTOP: "DESKTOP",
  BROWSER: "BROWSER",
  CLOUD: "CLOUD",
}

function getAppMode() {
  return process.env.MODE || appMode.CLOUD
}

export { appMode, getAppMode }
