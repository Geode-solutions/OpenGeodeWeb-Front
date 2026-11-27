import type { AttributeTimeStep, TimeStepKey } from "@ogw_front/types/attribute";
import type { AttributeName } from "@geode/opengeodeweb-viewer/schema_types";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { ModelComponentId } from "@ogw_front/types/identifiers";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import { attributeArrayName } from "@ogw_front/utils/attributes";
import { useDataStyleState } from "./state";

interface UseAttributeTimeStepStyleReturn {
  attributeTimeStep: (
    dataId: DataId,
    key: TimeStepKey,
    name: AttributeName | undefined,
  ) => AttributeTimeStep | undefined;
  setAttributeTimeStep: (
    dataId: DataId,
    key: TimeStepKey,
    name: AttributeName,
    timeStep: AttributeTimeStep,
  ) => Promise<unknown>;
  seriesArrayName: (dataId: DataId, key: TimeStepKey, name: AttributeName) => AttributeName;
}

// Re-render the other components showing the same series, one request per group.
// Identical config means same name, item, range, colormap and no data color.
// The group key is undefined for a component not showing the series.
async function reapplySameSeries(
  allIds: ModelComponentId[],
  targetIds: ModelComponentId[],
  groupKey: (componentId: ModelComponentId) => string | undefined,
  apply: (componentIds: NonEmptyArray<ModelComponentId>) => Promise<unknown>,
): Promise<void> {
  const groups: Record<string, NonEmptyArray<ModelComponentId>> = {};
  for (const componentId of allIds) {
    const key = groupKey(componentId);
    if (key !== undefined && !targetIds.includes(componentId)) {
      const group = groups[key];
      if (group === undefined) {
        groups[key] = [componentId];
      } else {
        group.push(componentId);
      }
    }
  }
  await Promise.all(
    Object.values(groups).map(async (componentIds) => {
      await apply(componentIds);
    }),
  );
}

// The key of a series is a schema $id: the back attribute names schema for meshes
// (cards share a step), the viewer attribute schema for models (one step per component type)
function useAttributeTimeStepStyle(): UseAttributeTimeStepStyleReturn {
  const dataStyleState = useDataStyleState();

  function attributeTimeStep(
    dataId: DataId,
    key: TimeStepKey,
    name: AttributeName | undefined,
  ): AttributeTimeStep | undefined {
    if (name === undefined) {
      return undefined;
    }
    return dataStyleState.getStyle(dataId).timeSteps?.[key]?.[name];
  }

  async function setAttributeTimeStep(
    dataId: DataId,
    key: TimeStepKey,
    name: AttributeName,
    timeStep: AttributeTimeStep,
  ): Promise<unknown> {
    const result = await dataStyleState.mutateStyle(dataId, {
      timeSteps: { [key]: { [name]: timeStep } },
    });
    return result;
  }

  // VTK array name of the series at its current time step
  function seriesArrayName(dataId: DataId, key: TimeStepKey, name: AttributeName): AttributeName {
    return attributeArrayName(name, attributeTimeStep(dataId, key, name));
  }

  return { attributeTimeStep, setAttributeTimeStep, seriesArrayName };
}

export { reapplySameSeries, useAttributeTimeStepStyle };
