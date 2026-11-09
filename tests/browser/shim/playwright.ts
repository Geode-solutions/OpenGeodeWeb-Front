// A subset of the Playwright test API, implemented inside the page, so that the e2e helpers written for
// Playwright (tests/browser/helpers, shared with Vease) run unchanged in Vitest browser mode. The locators are
// Resolved in the DOM, the input events are sent by Vitest's playwright provider. Only what the helpers use is here.
// The classes mirror Playwright's API: some of their methods do not need `this`
// oxlint-disable max-lines, max-classes-per-file, class-methods-use-this

// Third party imports
import { commands, userEvent, page as vitestPage } from "vitest/browser";
import { expect as vitestExpect } from "vitest";

const DEFAULT_TIMEOUT = 30_000;
const EXPECT_TIMEOUT = 5000;
const POLL_INTERVAL = 20;

type Root = Element | Document;
type Query = (roots: Root[]) => Root[];
type MouseButton = "left" | "right" | "middle";

interface ClickOptions {
  button?: MouseButton;
  position?: { x: number; y: number };
  force?: boolean;
  delay?: number;
  clickCount?: number;
  timeout?: number;
}

interface FilterOptions {
  hasText?: string | RegExp;
  hasNotText?: string | RegExp;
  has?: Locator;
  hasNot?: Locator;
  visible?: boolean;
}

interface RoleOptions {
  name?: string | RegExp;
  exact?: boolean;
  includeHidden?: boolean;
  checked?: boolean;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

type WaitState = "attached" | "detached" | "visible" | "hidden";

// ---- DOM helpers

async function sleep(milliseconds: number): Promise<void> {
  // oxlint-disable-next-line promise/avoid-new
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function poll<Result>(
  check: () => Result | undefined,
  timeout: number,
  message: () => string,
): Promise<Result> {
  const deadline = Date.now() + timeout;
  for (;;) {
    const result = check();
    if (result !== undefined) {
      return result;
    }
    if (Date.now() > deadline) {
      throw new Error(message());
    }
    // oxlint-disable-next-line no-await-in-loop
    await sleep(POLL_INTERVAL);
  }
}

function isElement(root: Root): root is Element {
  return root instanceof Element;
}

function inDocumentOrder(roots: Root[]): Root[] {
  return [...new Set(roots)].toSorted((first, second) => {
    if (first === second) {
      return 0;
    }
    // oxlint-disable-next-line no-bitwise
    const following = first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING;
    return following === 0 ? 1 : -1;
  });
}

function normalizeWhitespace(text: string | null | undefined): string {
  return (text ?? "").replaceAll(/\s+/gu, " ").trim();
}

// Like Playwright: a string matches case-insensitively as a substring, unless exact
function matchesText(content: string | null, expected: string | RegExp, exact = false): boolean {
  const text = normalizeWhitespace(content);
  if (expected instanceof RegExp) {
    return expected.test(text);
  }
  const wanted = normalizeWhitespace(expected);
  if (exact) {
    return text === wanted;
  }
  return text.toLowerCase().includes(wanted.toLowerCase());
}

// Like Playwright: a non-empty bounding box and no visibility:hidden
function isElementVisible(element: Element): boolean {
  if (!element.checkVisibility({ visibilityProperty: true })) {
    return false;
  }
  const { width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0;
}

function isHiddenForAria(element: Element): boolean {
  return (
    element.closest('[aria-hidden="true"]') !== null ||
    !element.checkVisibility({ visibilityProperty: true })
  );
}

function isElementEnabled(element: Element): boolean {
  const disabled = "disabled" in element && element.disabled === true;
  return !disabled && element.getAttribute("aria-disabled") !== "true";
}

function isElementChecked(element: Element): boolean {
  if (element instanceof HTMLInputElement) {
    return element.checked;
  }
  return element.getAttribute("aria-checked") === "true";
}

function asHtmlElement(element: Element): HTMLElement {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError(`${element.tagName} is not an HTML element`);
  }
  return element;
}

const ROLE_SELECTORS: Record<string, string> = {
  button:
    'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]',
  checkbox: 'input[type="checkbox"], [role="checkbox"]',
  option: 'option, [role="option"]',
  slider: 'input[type="range"], [role="slider"]',
  switch: '[role="switch"]',
  tab: '[role="tab"]',
};

function accessibleName(element: Element): string {
  const label = element.getAttribute("aria-label");
  if (label !== null && label !== "") {
    return label;
  }
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy !== null && labelledBy !== "") {
    return labelledBy
      .split(" ")
      .map((id) => document.querySelector(`#${CSS.escape(id)}`)?.textContent ?? "")
      .join(" ");
  }
  if (element instanceof HTMLInputElement && element.labels !== null && element.labels.length > 0) {
    return [...element.labels].map((labelElement) => labelElement.textContent).join(" ");
  }
  return element.textContent ?? "";
}

// Playwright key names ("Control+A") to user-event keyboard syntax ("{Control>}A{/Control}")
function keyboardSyntax(key: string): string {
  const parts = key.split("+");
  const main = parts.pop() ?? "";
  let text = main.length === 1 ? main : `{${main}}`;
  for (const modifier of parts) {
    text = `{${modifier}>}${text}{/${modifier}}`;
  }
  return text;
}

function mimeType(fileName: string): string {
  const extension = fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase();
  const types: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" };
  return types[extension] ?? "application/octet-stream";
}

// ---- Locator

class Locator {
  readonly #query: Query;
  readonly #description: string;

  public constructor(query: Query, description: string) {
    this.#query = query;
    this.#description = description;
  }

  public toString(): string {
    return this.#description;
  }

  // Elements matched under the given roots, used for `has` filters
  public query(roots: Root[]): Element[] {
    return this.#query(roots).filter((root) => isElement(root));
  }

  public elements(): Element[] {
    return this.query([document]);
  }

  #chain(step: (roots: Root[]) => Root[], description: string): Locator {
    return new Locator(
      (roots) => inDocumentOrder(step(this.#query(roots))),
      `${this.#description}.${description}`,
    );
  }

  // -- Selectors

  // Like Playwright, the options filter the matched elements
  public locator(selector: string, options?: FilterOptions): Locator {
    const located = this.#chain(
      (roots) => roots.flatMap((root) => [...root.querySelectorAll(selector)]),
      `locator(${selector})`,
    );
    if (options === undefined) {
      return located;
    }
    // A copy: an object literal, not a function reference passed to filter
    return located.filter({ ...options });
  }

  public getByTestId(testId: string): Locator {
    return this.locator(`[data-testid="${CSS.escape(testId)}"]`);
  }

  public getByRole(role: string, options: RoleOptions = {}): Locator {
    const selector = ROLE_SELECTORS[role] ?? `[role="${role}"]`;
    return this.#chain(
      (roots) =>
        roots
          .flatMap((root) => [...root.querySelectorAll(selector)])
          .filter((element) => options.includeHidden === true || !isHiddenForAria(element))
          .filter(
            (element) =>
              options.name === undefined ||
              matchesText(accessibleName(element), options.name, options.exact),
          )
          .filter(
            (element) =>
              options.checked === undefined || isElementChecked(element) === options.checked,
          ),
      `getByRole(${role})`,
    );
  }

  // The innermost elements whose text matches
  public getByText(text: string | RegExp, { exact = false }: { exact?: boolean } = {}): Locator {
    return this.#chain(
      (roots) =>
        roots
          .flatMap((root) => [...root.querySelectorAll("*:not(script):not(style)")])
          .filter(
            (element) =>
              matchesText(element.textContent, text, exact) &&
              ![...element.children].some((child) => matchesText(child.textContent, text, exact)),
          ),
      `getByText(${String(text)})`,
    );
  }

  public filter({ hasText, hasNotText, has, hasNot, visible }: FilterOptions): Locator {
    return this.#chain(
      (roots) =>
        roots
          .filter((root) => isElement(root))
          .filter(
            (element) =>
              (hasText === undefined || matchesText(element.textContent, hasText)) &&
              (hasNotText === undefined || !matchesText(element.textContent, hasNotText)) &&
              (has === undefined || has.query([element]).length > 0) &&
              (hasNot === undefined || hasNot.query([element]).length === 0) &&
              (visible === undefined || isElementVisible(element) === visible),
          ),
      "filter()",
    );
  }

  public nth(index: number): Locator {
    return this.#chain((roots) => {
      const root = roots.at(index);
      if (root === undefined) {
        return [];
      }
      return [root];
    }, `nth(${index})`);
  }

  public first(): Locator {
    return this.nth(0);
  }

  public last(): Locator {
    return this.nth(-1);
  }

  // Playwright's name
  // oxlint-disable-next-line id-length
  public or(other: Locator): Locator {
    return new Locator(
      (roots) => inDocumentOrder([...this.#query(roots), ...other.query(roots)]),
      `${this.#description}.or(${other.toString()})`,
    );
  }

  public async all(): Promise<Locator[]> {
    await Promise.resolve();
    return this.elements().map((_element, index) => this.nth(index));
  }

  // -- Waiting

  #single(): Element | undefined {
    const elements = this.elements();
    if (elements.length > 1) {
      throw new Error(
        `strict mode violation: ${this.#description} resolved to ${elements.length} elements`,
      );
    }
    return elements[0];
  }

  async #attached(timeout = DEFAULT_TIMEOUT): Promise<Element> {
    const element = await poll(
      () => this.#single(),
      timeout,
      () => `${this.#description} was not found`,
    );
    return element;
  }

  // Like Playwright's actionability checks: attached, visible and enabled, unless forced
  async #actionable(force = false, timeout = DEFAULT_TIMEOUT): Promise<Element> {
    const actionable = await poll(
      () => {
        const element = this.#single();
        if (element === undefined) {
          return undefined;
        }
        if (force || (isElementVisible(element) && isElementEnabled(element))) {
          return element;
        }
        return undefined;
      },
      timeout,
      () => `${this.#description} is not visible and enabled`,
    );
    return actionable;
  }

  public async waitFor({
    state = "visible",
    timeout = DEFAULT_TIMEOUT,
  }: { state?: WaitState; timeout?: number } = {}): Promise<void> {
    await poll(
      () => {
        const [element] = this.elements();
        const reached = {
          attached: element !== undefined,
          detached: element === undefined,
          visible: element !== undefined && isElementVisible(element),
          hidden: element === undefined || !isElementVisible(element),
        }[state];
        return reached ? true : undefined;
      },
      timeout,
      () => `${this.#description} did not become ${state}`,
    );
  }

  // -- Actions

  // The mouse is moved to the target first, without Playwright's hit-target check. Each action costs a round
  // Trip to Node here, slower than in Playwright: a hover tooltip (500 ms delay) of the element clicked before
  // Then has time to open over the target, and Playwright retries without moving the mouse away from it
  async #moveMouseTo(element: Element, position?: { x: number; y: number }): Promise<void> {
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
    const rect = element.getBoundingClientRect();
    const x = rect.x + (position?.x ?? rect.width / 2);
    const y = rect.y + (position?.y ?? rect.height / 2);
    await commands.mouse("move", x, y, { viewportWidth: globalThis.innerWidth });
  }

  public async click(options: ClickOptions = {}): Promise<void> {
    const element = await this.#actionable(options.force, options.timeout);
    await this.#moveMouseTo(element, options.position);
    await vitestPage.elementLocator(element).click(options);
  }

  public async dblclick(options: ClickOptions = {}): Promise<void> {
    const element = await this.#actionable(options.force, options.timeout);
    await this.#moveMouseTo(element, options.position);
    await vitestPage.elementLocator(element).dblClick(options);
  }

  public async hover(options: ClickOptions = {}): Promise<void> {
    const element = await this.#actionable(options.force, options.timeout);
    await this.#moveMouseTo(element, options.position);
    await vitestPage.elementLocator(element).hover(options);
  }

  public async fill(value: string, options: { force?: boolean } = {}): Promise<void> {
    const element = await this.#actionable(options.force);
    await vitestPage.elementLocator(element).fill(value);
  }

  public async press(key: string): Promise<void> {
    const element = await this.#actionable();
    asHtmlElement(element).focus();
    await userEvent.keyboard(keyboardSyntax(key));
  }

  public async setChecked(checked: boolean, options: ClickOptions = {}): Promise<void> {
    const element = await this.#actionable(options.force, options.timeout);
    if (isElementChecked(element) === checked) {
      return;
    }
    await this.#moveMouseTo(element, options.position);
    await vitestPage.elementLocator(element).click(options);
    await poll(
      () => (isElementChecked(element) === checked ? true : undefined),
      EXPECT_TIMEOUT,
      () => `Clicking ${this.#description} did not change its state`,
    );
  }

  public async check(options: ClickOptions = {}): Promise<void> {
    await this.setChecked(true, options);
  }

  public async uncheck(options: ClickOptions = {}): Promise<void> {
    await this.setChecked(false, options);
  }

  public async focus(): Promise<void> {
    const element = await this.#attached();
    asHtmlElement(element).focus();
  }

  public async blur(): Promise<void> {
    const element = await this.#attached();
    asHtmlElement(element).blur();
  }

  public async scrollIntoViewIfNeeded(): Promise<void> {
    const element = await this.#attached();
    element.scrollIntoView({ block: "nearest" });
  }

  public async setInputFiles(filePaths: string | string[]): Promise<void> {
    const input = await this.#attached();
    if (!(input instanceof HTMLInputElement)) {
      throw new TypeError(`${this.#description} is not an input`);
    }
    const transfer = new DataTransfer();
    for (const filePath of [filePaths].flat()) {
      // oxlint-disable-next-line no-await-in-loop
      const base64 = await commands.readFileBase64(filePath);
      const bytes = Uint8Array.from(atob(base64), (character) => character.codePointAt(0) ?? 0);
      const name = filePath.slice(filePath.replaceAll("\\", "/").lastIndexOf("/") + 1);
      transfer.items.add(new File([bytes], name, { type: mimeType(name) }));
    }
    input.files = transfer.files;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // -- Reading

  public async evaluate<Result, Argument>(
    pageFunction: (element: Element, argument: Argument | undefined) => Result | Promise<Result>,
    argument?: Argument,
  ): Promise<Result> {
    const element = await this.#attached();
    const result = await pageFunction(element, argument);
    return result;
  }

  public async evaluateAll<Result, Argument>(
    pageFunction: (
      elements: Element[],
      argument: Argument | undefined,
    ) => Result | Promise<Result>,
    argument?: Argument,
  ): Promise<Result> {
    const result = await pageFunction(this.elements(), argument);
    return result;
  }

  public async isVisible(): Promise<boolean> {
    await Promise.resolve();
    const element = this.#single();
    return element !== undefined && isElementVisible(element);
  }

  public async isHidden(): Promise<boolean> {
    const visible = await this.isVisible();
    return !visible;
  }

  public async isChecked(): Promise<boolean> {
    const element = await this.#attached();
    return isElementChecked(element);
  }

  public async isEnabled(): Promise<boolean> {
    const element = await this.#attached();
    return isElementEnabled(element);
  }

  public async isDisabled(): Promise<boolean> {
    const enabled = await this.isEnabled();
    return !enabled;
  }

  public async count(): Promise<number> {
    await Promise.resolve();
    return this.elements().length;
  }

  public async getAttribute(name: string): Promise<string | null> {
    const element = await this.#attached();
    return element.getAttribute(name);
  }

  public async textContent(): Promise<string | null> {
    const element = await this.#attached();
    return element.textContent;
  }

  public async inputValue(): Promise<string> {
    const element = await this.#attached();
    if (!(element instanceof HTMLInputElement)) {
      throw new TypeError(`${this.#description} is not an input`);
    }
    return element.value;
  }

  // In the coordinates of the test page, which the mouse command maps to the top page. Playwright returns null
  // For a hidden element: the helpers only test the result, undefined does the same
  public async boundingBox(): Promise<BoundingBox | undefined> {
    const element = await this.#attached();
    if (!isElementVisible(element)) {
      return undefined;
    }
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  }
}

// ---- Page

const documentRoot = new Locator((roots) => roots, "page");

function mouseOptions(options: { steps?: number; button?: MouseButton } = {}): {
  steps?: number;
  button?: MouseButton;
  viewportWidth: number;
} {
  return { ...options, viewportWidth: globalThis.innerWidth };
}

class Page {
  public readonly mouse = {
    move: async (x: number, y: number, options: { steps?: number } = {}): Promise<void> => {
      await commands.mouse("move", x, y, mouseOptions(options));
    },
    down: async (options: { button?: MouseButton } = {}): Promise<void> => {
      await commands.mouse("down", 0, 0, mouseOptions(options));
    },
    // Playwright's name
    // oxlint-disable-next-line id-length
    up: async (options: { button?: MouseButton } = {}): Promise<void> => {
      await commands.mouse("up", 0, 0, mouseOptions(options));
    },
    wheel: async (deltaX: number, deltaY: number): Promise<void> => {
      await commands.mouse("wheel", deltaX, deltaY, mouseOptions());
    },
  };

  public readonly keyboard = {
    press: async (key: string): Promise<void> => {
      await userEvent.keyboard(keyboardSyntax(key));
    },
  };

  public locator(selector: string, options?: FilterOptions): Locator {
    return documentRoot.locator(selector, options);
  }

  public getByTestId(testId: string): Locator {
    return documentRoot.getByTestId(testId);
  }

  public getByRole(role: string, options?: RoleOptions): Locator {
    return documentRoot.getByRole(role, options);
  }

  public getByText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return documentRoot.getByText(text, options);
  }

  public async waitForTimeout(milliseconds: number): Promise<void> {
    await sleep(milliseconds);
  }

  public async evaluate<Result, Argument>(
    pageFunction: (argument: Argument | undefined) => Result | Promise<Result>,
    argument?: Argument,
  ): Promise<Result> {
    const result = await pageFunction(argument);
    return result;
  }

  public async waitForFunction<Argument>(
    pageFunction: (argument: Argument | undefined) => unknown,
    argument?: Argument,
    {
      timeout = DEFAULT_TIMEOUT,
      polling = POLL_INTERVAL,
    }: { timeout?: number; polling?: number } = {},
  ): Promise<void> {
    const deadline = Date.now() + timeout;
    // Like Playwright, any truthy value ends the wait
    let done = Boolean(pageFunction(argument));
    while (!done) {
      if (timeout > 0 && Date.now() > deadline) {
        throw new Error("waitForFunction timed out");
      }
      // oxlint-disable-next-line no-await-in-loop
      await sleep(polling);
      done = Boolean(pageFunction(argument));
    }
  }

  public async addStyleTag({ content }: { content: string }): Promise<void> {
    await Promise.resolve();
    const style = document.createElement("style");
    style.textContent = content;
    document.head.append(style);
  }
}

// ---- expect: retrying assertions on locators, Vitest's expect for anything else

type LocatorCheck = () => boolean;
type LocatorMatcher = (...args: never[]) => Promise<void>;

interface TimeoutOptions {
  timeout?: number;
}

function locatorMatchers(locator: Locator, negated: boolean): Record<string, LocatorMatcher> {
  async function assert(name: string, check: LocatorCheck, timeout = EXPECT_TIMEOUT): Promise<void> {
    await poll(
      () => {
        try {
          return check() === !negated ? true : undefined;
        } catch {
          // The element changes while it is read: check again
          return undefined;
        }
      },
      timeout,
      () => `expect(${locator.toString()})${negated ? ".not" : ""}.${name} failed`,
    );
  }
  function single(): Element | undefined {
    return locator.elements()[0];
  }
  function visible(): boolean {
    const element = single();
    return element !== undefined && isElementVisible(element);
  }
  function enabled(): boolean {
    const element = single();
    return element !== undefined && isElementEnabled(element);
  }
  return {
    toBeVisible: async ({ timeout }: TimeoutOptions = {}): Promise<void> => {
      await assert("toBeVisible", visible, timeout);
    },
    toBeHidden: async ({ timeout }: TimeoutOptions = {}): Promise<void> => {
      await assert("toBeHidden", () => !visible(), timeout);
    },
    toBeAttached: async ({ timeout }: TimeoutOptions = {}): Promise<void> => {
      await assert("toBeAttached", () => single() !== undefined, timeout);
    },
    toBeEnabled: async ({ timeout }: TimeoutOptions = {}): Promise<void> => {
      await assert("toBeEnabled", enabled, timeout);
    },
    toBeDisabled: async ({ timeout }: TimeoutOptions = {}): Promise<void> => {
      await assert("toBeDisabled", () => single() !== undefined && !enabled(), timeout);
    },
    toBeChecked: async ({ timeout }: TimeoutOptions = {}): Promise<void> => {
      await assert(
        "toBeChecked",
        () => {
          const element = single();
          return element !== undefined && isElementChecked(element);
        },
        timeout,
      );
    },
    toHaveCount: async (count: number, { timeout }: TimeoutOptions = {}): Promise<void> => {
      await assert(`toHaveCount(${count})`, () => locator.elements().length === count, timeout);
    },
    toHaveText: async (text: string | RegExp, { timeout }: TimeoutOptions = {}): Promise<void> => {
      await assert(
        `toHaveText(${String(text)})`,
        () => {
          const element = single();
          return (
            element !== undefined &&
            matchesText(element.textContent, text, typeof text === "string")
          );
        },
        timeout,
      );
    },
    toContainText: async (
      text: string | RegExp,
      { timeout }: TimeoutOptions = {},
    ): Promise<void> => {
      await assert(
        `toContainText(${String(text)})`,
        () => {
          const element = single();
          return element !== undefined && matchesText(element.textContent, text);
        },
        timeout,
      );
    },
    toHaveValue: async (value: string, { timeout }: TimeoutOptions = {}): Promise<void> => {
      await assert(
        `toHaveValue(${value})`,
        () => {
          const element = single();
          return element instanceof HTMLInputElement && element.value === value;
        },
        timeout,
      );
    },
    toHaveAttribute: async (
      name: string,
      value?: string,
      { timeout }: TimeoutOptions = {},
    ): Promise<void> => {
      await assert(
        `toHaveAttribute(${name})`,
        () => {
          const attribute = single()?.getAttribute(name);
          if (value === undefined) {
            return attribute !== null && attribute !== undefined;
          }
          return attribute === value;
        },
        timeout,
      );
    },
  };
}

function expect(subject: unknown): unknown {
  if (subject instanceof Locator) {
    return { ...locatorMatchers(subject, false), not: locatorMatchers(subject, true) };
  }
  // The matchers are called by the test on the returned value
  // oxlint-disable-next-line vitest/valid-expect
  return vitestExpect(subject);
}
expect.poll = vitestExpect.poll;

export { Locator, Page, expect };
