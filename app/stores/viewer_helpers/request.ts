import type {
  JsonRpcSchema,
  ParamsOf,
  RequestHandlers,
  ResponseOf,
} from "@ogw_shared/utils/types.js";
import type { RpcClient } from "@ogw_shared/utils/call_raw.js";
import { viewer_call } from "@ogw_internal/utils/viewer_call";

interface ViewerRequestMicroservice {
  $id: string;
  client: RpcClient;
  base_url: string;
  start_request: () => void;
  stop_request: () => void;
}

interface ViewerRequestArgs<Schema extends JsonRpcSchema> {
  schema: Schema;
  params?: ParamsOf<Schema>;
  timeout?: number;
}

type ViewerRequest = <Schema extends JsonRpcSchema>(
  args: ViewerRequestArgs<Schema>,
  callbacks?: RequestHandlers<ResponseOf<Schema>>,
) => Promise<ResponseOf<Schema>>;

const MS_PER_SECOND = 1000;
const SECONDS_PER_REQUEST = 10;
const request_timeout = MS_PER_SECOND * SECONDS_PER_REQUEST;

async function callViewer<Schema extends JsonRpcSchema>(
  microservice: ViewerRequestMicroservice,
  { schema, params, timeout = request_timeout }: ViewerRequestArgs<Schema>,
  callbacks: RequestHandlers<ResponseOf<Schema>> = {},
): Promise<ResponseOf<Schema>> {
  const result = await viewer_call(
    microservice,
    {
      schema,
      params: params ?? {},
      timeout,
    },
    {
      ...callbacks,
      response_function: async (response: unknown) => {
        if (callbacks.response_function) {
          // The viewer validates its responses against the schema `response` it was generated from.
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion
          await callbacks.response_function(response as ResponseOf<Schema>);
        }
      },
    },
  );
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return result as ResponseOf<Schema>;
}

export { callViewer };
export type { ViewerRequest, ViewerRequestArgs };
