import type { AttributeName, AttributeTimeStep } from "@ogw_front/types/attribute";
import type { DataId } from "@ogw_front/types/identifiers";
import { attributeArrayName } from "@ogw_front/utils/attributes";
import { useDataStyleState } from "./state";

interface UseAttributeTimeStepStyleReturn {
  attributeTimeStep: (
    dataId: DataId,
    key: string,
    name: AttributeName | undefined,
  ) => AttributeTimeStep | undefined;
  setAttributeTimeStep: (
    dataId: DataId,
    key: string,
    name: AttributeName,
    timeStep: AttributeTimeStep,
  ) => Promise<unknown>;
  seriesArrayName: (dataId: DataId, key: string, name: AttributeName) => string;
}

// Re-render the other components showing the same series, one request per group.
// Identical config means same name, item, range, colormap and no data color.
// The group key is undefined for a component not showing the series.
async function reapplySameSeries(
  allIds: string[],
  targetIds: string[],
  groupKey: (componentId: string) => string | undefined,
  apply: (componentIds: string[]) => Promise<unknown>,
): Promise<void> {
  const groups: Record<string, string[]> = {};
  for (const componentId of allIds) {
    const key = groupKey(componentId);
    if (key !== undefined && !targetIds.includes(componentId)) {
      groups[key] ??= [];
      groups[key].push(componentId);
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
    key: string,
    name: AttributeName | undefined,
  ): AttributeTimeStep | undefined {
    if (name === undefined) {
      return undefined;
    }
    return dataStyleState.getStyle(dataId).timeSteps?.[key]?.[name];
  }

  async function setAttributeTimeStep(
    dataId: DataId,
    key: string,
    name: AttributeName,
    timeStep: AttributeTimeStep,
  ): Promise<unknown> {
    const result = await dataStyleState.mutateStyle(dataId, {
      timeSteps: { [key]: { [name]: timeStep } },
    });
    return result;
  }

  // VTK array name of the series at its current time step
  function seriesArrayName(dataId: DataId, key: string, name: AttributeName): string {
    return attributeArrayName(name, attributeTimeStep(dataId, key, name));
  }

  return { attributeTimeStep, setAttributeTimeStep, seriesArrayName };
}

export { reapplySameSeries, useAttributeTimeStepStyle };
