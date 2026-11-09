// A subset of the Playwright test API, implemented inside the page, so that the e2e helpers written for
// Playwright (tests/browser/helpers, shared with Vease) run unchanged in Vitest browser mode. The locators are resolved in
// the DOM, the input events are sent by Vitest's playwright provider. Only what the helpers use is here.
// oxlint-disable max-lines, max-classes-per-file

// Third party imports
import { commands, page as vitestPage, userEvent } from "vitest/browser";
import { expect as vitestExpect } from "vitest";

const DEFAULT_TIMEOUT = 30_000;
const EXPECT_TIMEOUT = 5000;
const POLL_INTERVAL = 20;

type Root = Element | Document;
type Query = (roots: Root[]) => Element[];

interface ClickOptions {
  button?: "left" | "right" | "middle";
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

type WaitState = "attached" | "detached" | "visible" | "hidden";

// ---- DOM helpers

function sleep(milliseconds: number): Promise<void> {
  // oxlint-disable-next-line promise/avoid-new
  return new Promise((resolve) => {
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

function inDocumentOrder(elements: Element[]): Element[] {
  return [...new Set(elements)].toSorted((first, second) => {
    if (first === second) {
      return 0;
    }
    // oxlint-disable-next-line no-bitwise
    return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
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
  return exact ? text === wanted : text.toLowerCase().includes(wanted.toLowerCase());
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
  return (
    !(element as HTMLInputElement).disabled && element.getAttribute("aria-disabled") !== "true"
  );
}

function isElementChecked(element: Element): boolean {
  if (element instanceof HTMLInputElement) {
    return element.checked;
  }
  return element.getAttribute("aria-checked") === "true";
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
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
  }
  if (element instanceof HTMLInputElement && element.labels && element.labels.length > 0) {
    return [...element.labels].map((labelElement) => labelElement.textContent).join(" ");
  }
  return element.textContent ?? "";
}

function keyboardSyntax(key: string): string {
  const parts = key.split("+");
  const main = parts.pop() ?? "";
  const mainKey = main.length === 1 ? main : `{${main}}`;
  return parts.reduce((text, modifier) => `{${modifier}>}${text}{/${modifier}}`, mainKey);
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

  constructor(query: Query, description: string) {
    this.#query = query;
    this.#description = description;
  }

  toString(): string {
    return this.#description;
  }

  // Elements matched under the given roots, used for `has` filters
  query(roots: Root[]): Element[] {
    return this.#query(roots);
  }

  elements(): Element[] {
    return this.#query([document]);
  }

  #chain(step: (elements: Root[]) => Element[], description: string): Locator {
    return new Locator(
      (roots) => inDocumentOrder(step(this.#query(roots))),
      `${this.#description}.${description}`,
    );
  }

  // -- Selectors

  // Like Playwright, the options filter the matched elements
  locator(selector: string, options?: FilterOptions): Locator {
    const located = this.#chain(
      (roots) => roots.flatMap((root) => [...root.querySelectorAll(selector)]),
      `locator(${selector})`,
    );
    return options ? located.filter(options) : located;
  }

  getByTestId(testId: string): Locator {
    return this.locator(`[data-testid="${CSS.escape(testId)}"]`);
  }

  getByRole(role: string, options: RoleOptions = {}): Locator {
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
  getByText(text: string | RegExp, { exact = false }: { exact?: boolean } = {}): Locator {
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

  filter({ hasText, hasNotText, has, hasNot, visible }: FilterOptions): Locator {
    return this.#chain(
      (roots) =>
        (roots as Element[]).filter(
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

  nth(index: number): Locator {
    return this.#chain((roots) => {
      const elements = roots as Element[];
      const element = index < 0 ? elements.at(index) : elements[index];
      return element ? [element] : [];
    }, `nth(${index})`);
  }

  first(): Locator {
    return this.nth(0);
  }

  last(): Locator {
    return this.nth(-1);
  }

  or(other: Locator): Locator {
    return new Locator(
      (roots) => inDocumentOrder([...this.#query(roots), ...other.query(roots)]),
      `${this.#description}.or(${other.toString()})`,
    );
  }

  async all(): Promise<Locator[]> {
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
    return poll(
      () => this.#single(),
      timeout,
      () => `${this.#description} was not found`,
    );
  }

  // Like Playwright's actionability checks: attached, visible and enabled, unless forced
  async #actionable(force = false, timeout = DEFAULT_TIMEOUT): Promise<Element> {
    return poll(
      () => {
        const element = this.#single();
        if (!element) {
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
  }

  async waitFor({
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
  // trip to Node here, slower than in Playwright: a hover tooltip (500 ms delay) of the element clicked before
  // then has time to open over the target, and Playwright retries without moving the mouse away from it
  async #moveMouseTo(element: Element, position?: { x: number; y: number }): Promise<void> {
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
    const rect = element.getBoundingClientRect();
    const x = rect.x + (position?.x ?? rect.width / 2);
    const y = rect.y + (position?.y ?? rect.height / 2);
    await commands.mouse("move", x, y, { viewportWidth: globalThis.innerWidth });
  }

  async click(options: ClickOptions = {}): Promise<void> {
    const element = await this.#actionable(options.force, options.timeout);
    await this.#moveMouseTo(element, options.position);
    await vitestPage.elementLocator(element).click(options);
  }

  async dblclick(options: ClickOptions = {}): Promise<void> {
    const element = await this.#actionable(options.force, options.timeout);
    await this.#moveMouseTo(element, options.position);
    await vitestPage.elementLocator(element).dblClick(options);
  }

  async hover(options: ClickOptions = {}): Promise<void> {
    const element = await this.#actionable(options.force, options.timeout);
    await this.#moveMouseTo(element, options.position);
    await vitestPage.elementLocator(element).hover(options);
  }

  async fill(value: string, options: { force?: boolean } = {}): Promise<void> {
    const element = await this.#actionable(options.force);
    await vitestPage.elementLocator(element).fill(value);
  }

  async press(key: string): Promise<void> {
    const element = await this.#actionable();
    (element as HTMLElement).focus();
    await userEvent.keyboard(keyboardSyntax(key));
  }

  async setChecked(checked: boolean, options: ClickOptions = {}): Promise<void> {
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

  async check(options: ClickOptions = {}): Promise<void> {
    await this.setChecked(true, options);
  }

  async uncheck(options: ClickOptions = {}): Promise<void> {
    await this.setChecked(false, options);
  }

  async focus(): Promise<void> {
    ((await this.#attached()) as HTMLElement).focus();
  }

  async blur(): Promise<void> {
    ((await this.#attached()) as HTMLElement).blur();
  }

  async scrollIntoViewIfNeeded(): Promise<void> {
    (await this.#attached()).scrollIntoView({ block: "nearest" });
  }

  async setInputFiles(filePaths: string | string[]): Promise<void> {
    const input = (await this.#attached()) as HTMLInputElement;
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

  async evaluate<Result, Argument>(
    pageFunction: (element: Element, argument: Argument) => Result | Promise<Result>,
    argument?: Argument,
  ): Promise<Result> {
    const element = await this.#attached();
    return pageFunction(element, argument as Argument);
  }

  async evaluateAll<Result, Argument>(
    pageFunction: (elements: Element[], argument: Argument) => Result | Promise<Result>,
    argument?: Argument,
  ): Promise<Result> {
    return pageFunction(this.elements(), argument as Argument);
  }

  async isVisible(): Promise<boolean> {
    await Promise.resolve();
    const element = this.#single();
    return element !== undefined && isElementVisible(element);
  }

  async isHidden(): Promise<boolean> {
    return !(await this.isVisible());
  }

  async isChecked(): Promise<boolean> {
    return isElementChecked(await this.#attached());
  }

  async isEnabled(): Promise<boolean> {
    return isElementEnabled(await this.#attached());
  }

  async isDisabled(): Promise<boolean> {
    return !(await this.isEnabled());
  }

  async count(): Promise<number> {
    await Promise.resolve();
    return this.elements().length;
  }

  async getAttribute(name: string): Promise<string | null> {
    return (await this.#attached()).getAttribute(name);
  }

  async textContent(): Promise<string | null> {
    return (await this.#attached()).textContent;
  }

  async innerText(): Promise<string> {
    return ((await this.#attached()) as HTMLElement).innerText;
  }

  async inputValue(): Promise<string> {
    return ((await this.#attached()) as HTMLInputElement).value;
  }

  // In the coordinates of the test page, which the mouse command maps to the top page
  async boundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null> {
    const element = await this.#attached();
    if (!isElementVisible(element)) {
      return null;
    }
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  }
}

// ---- Page

const documentRoot = new Locator((roots) => roots as Element[], "page");

function mouseOptions(options: { steps?: number; button?: "left" | "right" | "middle" } = {}): {
  steps?: number;
  button?: "left" | "right" | "middle";
  viewportWidth: number;
} {
  return { ...options, viewportWidth: globalThis.innerWidth };
}

class Page {
  readonly mouse = {
    move: (x: number, y: number, options: { steps?: number } = {}): Promise<void> =>
      commands.mouse("move", x, y, mouseOptions(options)),
    down: (options: { button?: "left" | "right" | "middle" } = {}): Promise<void> =>
      commands.mouse("down", 0, 0, mouseOptions(options)),
    up: (options: { button?: "left" | "right" | "middle" } = {}): Promise<void> =>
      commands.mouse("up", 0, 0, mouseOptions(options)),
    wheel: (deltaX: number, deltaY: number): Promise<void> =>
      commands.mouse("wheel", deltaX, deltaY, mouseOptions()),
  };

  readonly keyboard = {
    press: (key: string): Promise<void> => userEvent.keyboard(keyboardSyntax(key)),
  };

  locator(selector: string, options?: FilterOptions): Locator {
    return documentRoot.locator(selector, options);
  }

  getByTestId(testId: string): Locator {
    return documentRoot.getByTestId(testId);
  }

  getByRole(role: string, options?: RoleOptions): Locator {
    return documentRoot.getByRole(role, options);
  }

  getByText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return documentRoot.getByText(text, options);
  }

  async waitForTimeout(milliseconds: number): Promise<void> {
    await sleep(milliseconds);
  }

  async evaluate<Result, Argument>(
    pageFunction: (argument: Argument) => Result | Promise<Result>,
    argument?: Argument,
  ): Promise<Result> {
    return pageFunction(argument as Argument);
  }

  async waitForFunction<Argument>(
    pageFunction: (argument: Argument) => unknown,
    argument?: Argument,
    {
      timeout = DEFAULT_TIMEOUT,
      polling = POLL_INTERVAL,
    }: { timeout?: number; polling?: number } = {},
  ): Promise<void> {
    const deadline = Date.now() + timeout;
    while (!pageFunction(argument as Argument)) {
      if (timeout > 0 && Date.now() > deadline) {
        throw new Error("waitForFunction timed out");
      }
      // oxlint-disable-next-line no-await-in-loop
      await sleep(polling);
    }
  }

  async addStyleTag({ content }: { content: string }): Promise<void> {
    await Promise.resolve();
    const style = document.createElement("style");
    style.textContent = content;
    document.head.append(style);
  }
}

// ---- expect: retrying assertions on locators, Vitest's expect for anything else

type LocatorAssertion = (locator: Locator) => Promise<boolean> | boolean;

function locatorMatchers(
  locator: Locator,
  negated: boolean,
): Record<string, (...args: never[]) => Promise<void>> {
  async function assert(
    name: string,
    check: LocatorAssertion,
    timeout = EXPECT_TIMEOUT,
  ): Promise<void> {
    await poll(
      () => {
        try {
          // Synchronous checks only: the locator reads are synchronous under the hood
          const result = check(locator);
          if (result instanceof Promise) {
            throw new TypeError("asynchronous check");
          }
          return result === !negated ? true : undefined;
        } catch (error) {
          if (error instanceof TypeError) {
            throw error;
          }
          return undefined;
        }
      },
      timeout,
      () => `expect(${locator.toString()})${negated ? ".not" : ""}.${name} failed`,
    );
  }
  const single = (): Element | undefined => locator.elements()[0];
  return {
    toBeVisible: async ({ timeout }: { timeout?: number } = {}) =>
      assert(
        "toBeVisible",
        () => {
          const element = single();
          return element !== undefined && isElementVisible(element);
        },
        timeout,
      ),
    toBeHidden: async ({ timeout }: { timeout?: number } = {}) =>
      assert(
        "toBeHidden",
        () => {
          const element = single();
          return element === undefined || !isElementVisible(element);
        },
        timeout,
      ),
    toBeAttached: async ({ timeout }: { timeout?: number } = {}) =>
      assert("toBeAttached", () => single() !== undefined, timeout),
    toBeEnabled: async ({ timeout }: { timeout?: number } = {}) =>
      assert(
        "toBeEnabled",
        () => {
          const element = single();
          return element !== undefined && isElementEnabled(element);
        },
        timeout,
      ),
    toBeDisabled: async ({ timeout }: { timeout?: number } = {}) =>
      assert(
        "toBeDisabled",
        () => {
          const element = single();
          return element !== undefined && !isElementEnabled(element);
        },
        timeout,
      ),
    toBeChecked: async ({ timeout }: { timeout?: number } = {}) =>
      assert(
        "toBeChecked",
        () => {
          const element = single();
          return element !== undefined && isElementChecked(element);
        },
        timeout,
      ),
    toHaveCount: async (count: number, { timeout }: { timeout?: number } = {}) =>
      assert(`toHaveCount(${count})`, () => locator.elements().length === count, timeout),
    toHaveText: async (text: string | RegExp, { timeout }: { timeout?: number } = {}) =>
      assert(
        `toHaveText(${String(text)})`,
        () => {
          const element = single();
          return (
            element !== undefined &&
            matchesText(element.textContent, text, typeof text === "string")
          );
        },
        timeout,
      ),
    toContainText: async (text: string | RegExp, { timeout }: { timeout?: number } = {}) =>
      assert(
        `toContainText(${String(text)})`,
        () => {
          const element = single();
          return element !== undefined && matchesText(element.textContent, text);
        },
        timeout,
      ),
    toHaveValue: async (value: string, { timeout }: { timeout?: number } = {}) =>
      assert(
        `toHaveValue(${value})`,
        () => (single() as HTMLInputElement | undefined)?.value === value,
        timeout,
      ),
    toHaveAttribute: async (name: string, value?: string, { timeout }: { timeout?: number } = {}) =>
      assert(
        `toHaveAttribute(${name})`,
        () => {
          const attribute = single()?.getAttribute(name);
          return value === undefined
            ? attribute !== null && attribute !== undefined
            : attribute === value;
        },
        timeout,
      ),
  };
}

function expect(subject: unknown): unknown {
  if (subject instanceof Locator) {
    return { ...locatorMatchers(subject, false), not: locatorMatchers(subject, true) };
  }
  return vitestExpect(subject);
}
expect.poll = vitestExpect.poll;

export { Locator, Page, expect };
