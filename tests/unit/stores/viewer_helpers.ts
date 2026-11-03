// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import { WebSocket } from "ws";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";

interface MockLock {
  name: string;
}

const TIMEOUT = 5000;

function stubNavigatorLocks(): void {
  // Mock navigator.locks API
  const mockLockRequest = vi
    .fn()
    .mockImplementation((name: string, handler: (lock: MockLock) => unknown) => handler({ name }));

  // The store only ever calls `navigator.locks.request`, and `vi.stubGlobal`
  // Accepts an `unknown` value, so a minimal stub (rather than spreading or
  // Mutating the real, getter-only `navigator` instance) is enough and needs
  // No type assertion.
  vi.stubGlobal("navigator", {
    locks: {
      request: mockLockRequest,
    },
  });
}

// Registers the hooks shared by every viewer store test file; call it inside the top-level describe.
function setupViewerEnvironment(): void {
  beforeAll(() => {
    // The `ws` package's WebSocket class implements the same runtime behaviour
    // The store relies on in a Node test environment, but TypeScript sees it as
    // A structurally different class from the DOM lib's global WebSocket type,
    // So it is stubbed through vitest's helper (typed to accept `unknown`)
    // Instead of an unsafe type assertion.
    vi.stubGlobal("WebSocket", WebSocket);
  });

  beforeEach(() => {
    setupActivePinia();
  });

  afterAll(() => {
    Reflect.deleteProperty(globalThis, "WebSocket");
  });
}

export { TIMEOUT, setupViewerEnvironment, stubNavigatorLocks };
