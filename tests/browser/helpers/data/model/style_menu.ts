import type { Page } from "@playwright/test";
import { ensureMenuOpen } from "#browser_helpers/viewer_interaction";
import { selectModelOptionsTab } from "#browser_helpers/model_tabs";

// Model style options sit behind the type or components tab
async function showModelStyleOptions(window: Page): Promise<void> {
  await ensureMenuOpen(window, "modelStyleMenu");
  await selectModelOptionsTab(window);
}

export { showModelStyleOptions };
