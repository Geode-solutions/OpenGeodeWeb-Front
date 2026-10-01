import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import { useBackStore } from "@ogw_front/stores/back";

async function requestForTargets<TResponse>(
  schema: JsonRpcSchema,
  targetIds: readonly string[],
  fallback: TResponse,
): Promise<[string, TResponse][]> {
  const backStore = useBackStore();
  const responses = await Promise.all(
    targetIds.map(async (targetId): Promise<[string, TResponse]> => {
      try {
        const response = await backStore.request({ schema, params: { id: targetId } });
        // oxlint-disable-next-line no-unsafe-type-assertion -- this is the trusted API boundary.
        return [targetId, response as TResponse];
      } catch {
        return [targetId, fallback];
      }
    }),
  );
  return responses;
}

export { requestForTargets };
