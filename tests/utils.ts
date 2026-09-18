// Third party imports
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import type { HTTPMethod } from "h3";
import { createTestingPinia } from "@pinia/testing";
import { createVuetify } from "vuetify";
import { setActivePinia } from "pinia";
import { vi } from "vitest";

const vuetify = createVuetify({ components, directives });

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
function assertDefined<T>(value: T | undefined, message = "Expected value to be defined"): T {
  if (value === undefined) {
    throw new Error(message);
  }
  return value;
}

export { setupActivePinia, vuetify, toHTTPMethod, assertDefined };
