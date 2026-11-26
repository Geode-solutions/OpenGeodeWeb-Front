// Third party imports
import { commands, userEvent } from "vitest/browser";
import { describe, expect, test, vi } from "vitest";

vi.setConfig({ testTimeout: 10_000 });

// The test files of a shard run at the same time in one browser context: a copy in one of them
// Must not reach the clipboard the others paste from
describe("clipboard", () => {
  test("a test file copies to its own clipboard", async () => {
    const copiedText = `clipboard of ${crypto.randomUUID()}`;
    // The clipboard needs a focused document, which the copy buttons get from their click
    await userEvent.click(document.body);
    await navigator.clipboard.writeText(copiedText);

    await expect(navigator.clipboard.readText()).resolves.toBe(copiedText);
    await expect(commands.readBrowserClipboard()).resolves.not.toBe(copiedText);
  });
});
