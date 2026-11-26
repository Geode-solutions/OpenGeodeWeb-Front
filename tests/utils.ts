// Third party imports
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import type { HTTPMethod } from "h3";
import { createTestingPinia } from "@pinia/testing";
import { createVuetify } from "vuetify";
import { setActivePinia } from "pinia";
import { vi } from "vitest";

// Local imports
import { type NonEmptyArray, isNonEmpty } from "@ogw_front/utils/arrays";
import { phosphorIconOptions } from "@ogw_front/utils/phosphor_icons";

const vuetify = createVuetify({ components, directives, icons: phosphorIconOptions() });

function setupActivePinia(): ReturnType<typeof createTestingPinia> {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  });
  setActivePinia(pinia);
  return pinia;
}

const HTTP_METHODS: readonly HTTPMethod[] = [
  "GET",
  "HEAD",
  "PATCH",
  "POST",
  "PUT",
  "CONNECT",
  "DELETE",
  "OPTIONS",
  "TRACE",
];

function isHTTPMethod(method: string): method is HTTPMethod {
  return (HTTP_METHODS as readonly string[]).includes(method);
}

// Narrows a schema's method string down to `HTTPMethod` through a real runtime check instead of an unsafe type assertion.
function toHTTPMethod(method: string | undefined): HTTPMethod {
  if (method === undefined || !isHTTPMethod(method)) {
    throw new Error(`Not a valid HTTP method: ${String(method)}`);
  }
  return method;
}

// Narrows a possibly-undefined value (e.g. an array index access) through a real runtime check instead of a non-null assertion.
function assertDefined<TValue>(
  value: TValue | undefined,
  message = "Expected value to be defined",
): TValue {
  if (value === undefined) {
    throw new Error(message);
  }
  return value;
}

// Narrows an array that must hold at least one item (e.g. the component ids of a fixture model) through a real runtime check.
function assertNonEmpty<TItem>(
  items: TItem[],
  message = "Expected a non-empty array",
): NonEmptyArray<TItem> {
  if (!isNonEmpty(items)) {
    throw new Error(message);
  }
  return items;
}

// Types a mock as the function it replaces when that function is generic (e.g. `backStore.request`, generic over its schema): the mock only implements it for the route under test.
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
function mockAs<TTarget>(mock: unknown): TTarget {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return mock as TTarget;
}

export { setupActivePinia, vuetify, toHTTPMethod, assertDefined, assertNonEmpty, mockAs };
