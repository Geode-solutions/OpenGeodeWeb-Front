// Third party imports
import { describe, expect, test, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import ClippingPlaneCard from "@ogw_front/components/ClippingPlaneCard.vue";
import { parseCoordinates } from "@ogw_front/utils/coordinates";
import { vuetify } from "@ogw_tests/utils";

vi.setConfig({ testTimeout: 10_000 });

const OPACITY = 0.5;
const HALF = 0.5;
const EASTING = 401_250.5;
const NORTHING = 6_512_000;
const DEPTH = -1200;
const SCIENTIFIC = -300;
const FIRST = 1.5;
const SECOND = 2;
const PASTED_POINT = `${EASTING}, ${NORTHING}, ${DEPTH}`;

interface Plane {
  origin?: number[];
  normal: number[];
  opacity: number;
}

async function mountCard(plane: Plane): Promise<VueWrapper> {
  const wrapper = await mountSuspended(ClippingPlaneCard, {
    global: { plugins: [vuetify] },
    props: { plane, index: 0 },
  });
  return wrapper;
}

function paste(field: Element, text: string): boolean {
  const event = new Event("paste", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clipboardData", { value: { getData: () => text } });
  return field.dispatchEvent(event);
}

function axisInput(wrapper: VueWrapper, testId: string, axis: number): Element {
  const element = wrapper.findAll(`[data-testid="${testId}"] input`)[axis]?.element;
  if (!element) {
    throw new Error(`No ${testId} input for axis ${axis}`);
  }
  return element;
}

describe("pasted coordinates", () => {
  test("reads the numbers whatever separates them", () => {
    expect(parseCoordinates("1.5, 2; -3e2")).toStrictEqual([FIRST, SECOND, SCIENTIFIC]);
    expect(parseCoordinates(`X: ${EASTING}\tY: ${NORTHING}\tZ: ${DEPTH}`)).toStrictEqual([
      EASTING,
      NORTHING,
      DEPTH,
    ]);
    expect(parseCoordinates(".5 +2")).toStrictEqual([HALF, SECOND]);
    expect(parseCoordinates("no number")).toStrictEqual([]);
  });
});

describe("clipping plane card", () => {
  test("a pasted point fills the three origin coordinates", async () => {
    const plane: Plane = { origin: [0, 0, 0], normal: [1, 0, 0], opacity: OPACITY };
    const wrapper = await mountCard(plane);
    const isDefaultPasted = paste(axisInput(wrapper, "planeOriginInput", 1), PASTED_POINT);
    expect(isDefaultPasted).toBe(false);
    expect(plane.origin).toStrictEqual([EASTING, NORTHING, DEPTH]);
  });

  test("a pasted vector fills the three normal coordinates", async () => {
    const plane: Plane = { origin: [0, 0, 0], normal: [1, 0, 0], opacity: OPACITY };
    const wrapper = await mountCard(plane);
    paste(axisInput(wrapper, "planeNormalInput", 0), "0 0.5 -1");
    expect(plane.normal).toStrictEqual([0, HALF, -1]);
  });

  test("a single pasted number is left to the field", async () => {
    const plane: Plane = { origin: [1, 2, 3], normal: [1, 0, 0], opacity: OPACITY };
    const wrapper = await mountCard(plane);
    const isDefaultPasted = paste(axisInput(wrapper, "planeOriginInput", 0), "42");
    expect(isDefaultPasted).toBe(true);
    expect(plane.origin).toStrictEqual([1, 2, 3]);
  });
});
