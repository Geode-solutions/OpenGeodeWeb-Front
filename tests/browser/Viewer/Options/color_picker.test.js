import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";

import ColorPicker from "@/components/Viewer/Options/ColorPicker";
import { vuetify } from "@ogw_tests/utils";

test("Graphic test for ColorPicker", async () => {
  const component = await render(ColorPicker, {
    global: {
      plugins: [vuetify],
    },
  });
  await expect(component.container).toMatchScreenshot();
});
