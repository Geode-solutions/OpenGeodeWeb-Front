// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { vi } from "vitest";

// Local imports
import type { ViewerRequest } from "@ogw_front/stores/viewer_helpers/request";
import { mockAs } from "@ogw_tests/utils";

// A viewer request mock recording the schema of each request, in order
function recordRequests(): { request: ViewerRequest; schemas: unknown[] } {
  const schemas: unknown[] = [];
  const request = mockAs<ViewerRequest>(
    vi.fn(async (args: { schema: unknown }) => {
      schemas.push(args.schema);
      await Promise.resolve();
    }),
  );
  return { request, schemas };
}

export { recordRequests };
