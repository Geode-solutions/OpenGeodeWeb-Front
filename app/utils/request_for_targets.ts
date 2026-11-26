import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import { useBackStore } from "@ogw_front/stores/back";

async function requestForTargets<TResponse>(
  schema: JsonRpcSchema,
  targetIds: readonly DataId[],
  fallback: TResponse,
): Promise<[DataId, TResponse][]> {
  const backStore = useBackStore();
  const responses = await Promise.all(
    targetIds.map(async (targetId): Promise<[DataId, TResponse]> => {
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
