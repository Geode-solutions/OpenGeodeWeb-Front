import { expect, test } from "vitest"
import { render } from "vitest-browser-vue"

import VisibilitySwitch from "@/components/Viewer/Options/VisibilitySwitch"
import { vuetify } from "../../../utils"

test("Graphic test for VisibilitySwitch", async () => {
  const component = await render(VisibilitySwitch, {
    global: {
      plugins: [vuetify],
    },
  })
  await expect(component.container).toMatchScreenshot("VisibilitySwitch")
})
