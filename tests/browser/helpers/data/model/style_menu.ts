import type { Page } from "@playwright/test";
import { ensureMenuOpen } from "../../viewer_interaction";
import { selectModelOptionsTab } from "../../model_tabs";

// Model style options sit behind the type or components tab
async function showModelStyleOptions(window: Page): Promise<void> {
  await ensureMenuOpen(window, "modelStyleMenu");
  await selectModelOptionsTab(window);
}

export { showModelStyleOptions };
