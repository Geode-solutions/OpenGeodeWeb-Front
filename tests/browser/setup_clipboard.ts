// The test files of a shard run at the same time in one browser context, which has one clipboard:
// Each test file gets its own, so that a copy in one of them does not reach the paste of another

const TEXT_TYPE = "text/plain";

class TestFileClipboard extends EventTarget implements Clipboard {
  private items: ClipboardItem[] = [];

  public async read(): Promise<ClipboardItems> {
    await Promise.resolve();
    return [...this.items];
  }

  public async readText(): Promise<string> {
    const item = this.items.find((candidate) => candidate.types.includes(TEXT_TYPE));
    if (item === undefined) {
      return "";
    }
    const blob = await item.getType(TEXT_TYPE);
    const text = await blob.text();
    return text;
  }

  public async write(items: ClipboardItems): Promise<void> {
    this.items = [...items];
    await Promise.resolve();
  }

  public async writeText(text: string): Promise<void> {
    this.items = [new ClipboardItem({ [TEXT_TYPE]: text })];
    await Promise.resolve();
  }
}

Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  value: new TestFileClipboard(),
});
