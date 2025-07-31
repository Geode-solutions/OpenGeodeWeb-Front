function getCaptchaState() {
  if (
    getAppMode() === appMode.appMode.BROWSER ||
    getAppMode() === appMode.appMode.DESKTOP
  ) {
    return true
  }
  return false
}

export default getCaptchaState
