import { expect, test } from "vitest"
import { render } from "vitest-browser-vue"

import VisibilitySwitch from "@/components/Viewer/Options/VisibilitySwitch.vue"
import { vuetify } from "../../../utils"

console.log("VisibilitySwitch", VisibilitySwitch)

test("Graphic test for VisibilitySwitch", async () => {
  const component = await render(VisibilitySwitch, {
    global: {
      plugins: [vuetify],
    },
  })
  console.log("component", component)
  await expect(component).toMatchScreenshot()
})
