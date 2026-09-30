import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import { useBackStore } from "@ogw_front/stores/back";

async function requestForTargets<TResponse>(
  schema: JsonRpcSchema,
  targetIds: readonly string[],
): Promise<Map<string, TResponse>> {
  const backStore = useBackStore();
  const results = await Promise.allSettled(
    targetIds.map(async (targetId) => {
      // oxlint-disable-next-line no-unsafe-type-assertion -- this is the trusted API boundary.
      const response = (await backStore.request({ schema, params: { id: targetId } })) as TResponse;
      return [targetId, response] as const;
    }),
  );
  return new Map(
    results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : [])),
  );
}

export { requestForTargets };
