// Third party imports
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { createTestingPinia } from "@pinia/testing"
import { createVuetify } from "vuetify"
import { setActivePinia } from "pinia"

const vuetify = createVuetify({ components, directives })

function setupActivePinia() {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  return pinia
}

export { setupActivePinia, vuetify }