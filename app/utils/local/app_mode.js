const appMode = {
  DESKTOP: "DESKTOP",
  BROWSER: "BROWSER",
  CLOUD: "CLOUD",
}

function getAppMode() {
  console.log(
    "[getAppMode] useRuntimeConfig().public.MODE",
    useRuntimeConfig().public.MODE,
  )
  return useRuntimeConfig().public.MODE
}

export { appMode, getAppMode }
