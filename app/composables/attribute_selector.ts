import type { AttributeTimeStep, ValidAttributeRange } from "@ogw_front/types/attribute";
import type { AttributeRangeInfo } from "@ogw_front/utils/attribute_range";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { ModelComponentId } from "@ogw_front/types/identifiers";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import { getAttributeRange } from "@ogw_front/utils/attributes";

// The minimum and maximum of an attribute range: each one is clamped by the other
function useAttributeRangeBounds(attributeRange: Ref<(number | undefined)[]>): {
  rangeMin: WritableComputedRef<number | undefined>;
  rangeMax: WritableComputedRef<number | undefined>;
} {
  const rangeMin = computed<number | undefined>({
    get: () => attributeRange.value[0],
    set: (val: number | undefined) => {
      if (val === undefined) {
        return;
      }
      const [, currentMax] = attributeRange.value;
      let newMin = val;
      if (typeof currentMax === "number" && val > currentMax) {
        newMin = currentMax;
      }
      attributeRange.value = [newMin, currentMax];
    },
  });
  const rangeMax = computed<number | undefined>({
    get: () => attributeRange.value[1],
    set: (val: number | undefined) => {
      if (val === undefined) {
        return;
      }
      const [currentMin] = attributeRange.value;
      let newMax = val;
      if (typeof currentMin === "number" && val < currentMin) {
        newMax = currentMin;
      }
      attributeRange.value = [currentMin, newMax];
    },
  });
  return { rangeMin, rangeMax };
}

// The items of an attribute with several components
function attributeItemOptions(itemCount: number): { title: string; value: number }[] {
  return Array.from({ length: itemCount }, (_, index) => ({
    title: `Item ${index + 1}`,
    value: index,
  }));
}

// The range of every target for the picked item
function attributeRangesPerTarget(
  rangesPerTarget: ReadonlyMap<DataId, AttributeRangeInfo>,
  item: number,
): Map<DataId, ValidAttributeRange> {
  const ranges = new Map<DataId, ValidAttributeRange>();
  for (const [targetId, range] of rangesPerTarget) {
    const { min, max } = getAttributeRange(range, item);
    ranges.set(targetId, [min, max]);
  }
  return ranges;
}

// Commits the first time step when the picked series changes and the stored one is not valid
function useSeriesTimeStepCommit(
  timeSteps: ComputedRef<number[]>,
  seriesName: () => string | undefined,
  attributeTimeStep: Readonly<Ref<AttributeTimeStep | undefined>>,
  resetTimeStep: () => void,
): () => void {
  let committedSeries: string | undefined = undefined;

  return (): void => {
    if (timeSteps.value.length === 0) {
      committedSeries = undefined;
      return;
    }
    const name = seriesName();
    if (name === committedSeries) {
      return;
    }
    committedSeries = name;
    const current = attributeTimeStep.value;
    const valid = current !== undefined && current >= 0 && current < timeSteps.value.length;
    // A valid step is already stored and applied with the series: emitting it again re-applies the attribute
    if (!valid) {
      resetTimeStep();
    }
  };
}

interface AttributeRequestParams {
  id: DataId;
  component_ids?: NonEmptyArray<ModelComponentId>;
}

// Params of the "names" request: model routes need the components, mesh routes have none
function attributeRequestParams(
  dataId: DataId,
  componentIds: NonEmptyArray<ModelComponentId> | undefined,
): AttributeRequestParams {
  if (componentIds === undefined) {
    return { id: dataId };
  }
  return { id: dataId, component_ids: componentIds };
}

export type { AttributeInfo } from "@ogw_front/utils/attributes";
export {
  type AttributeRequestParams,
  attributeItemOptions,
  attributeRequestParams,
  attributeRangesPerTarget,
  useAttributeRangeBounds,
  useSeriesTimeStepCommit,
};
