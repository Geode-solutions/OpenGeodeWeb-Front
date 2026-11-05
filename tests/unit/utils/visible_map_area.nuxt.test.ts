// oxlint-disable no-magic-numbers
import { describe, expect, test } from "vitest";
import {
  needsSharperMap,
  screenPixelGroundSize,
  stillSharp,
  visibleMapArea,
} from "@ogw_front/utils/visible_map_area";

const BASE = { x_min: -1000, y_min: -1000, x_max: 1000, y_max: 1000 };
// Looking straight down from 100 m, 90° vertical field of view: 200 m seen vertically
const TOP_VIEW = {
  position: [0, 0, 100] as [number, number, number],
  focal_point: [0, 0, 0] as [number, number, number],
  view_up: [0, 1, 0] as [number, number, number],
  view_angle: 90,
  distance: 100,
};

describe("visible map area", () => {
  test("a top view sees a rectangle around the focal point", () => {
    const visibleArea = visibleMapArea(TOP_VIEW, 2, 0, BASE);
    expect(visibleArea?.y_min).toBeCloseTo(-100);
    expect(visibleArea?.y_max).toBeCloseTo(100);
    expect(visibleArea?.x_min).toBeCloseTo(-200);
    expect(visibleArea?.x_max).toBeCloseTo(200);
  });

  test("a view towards the horizon stays within the base", () => {
    const grazing = {
      ...TOP_VIEW,
      position: [0, -100, 5] as [number, number, number],
      view_up: [0, 0, 1] as [number, number, number],
    };
    expect(visibleMapArea(grazing, 1, 0, BASE)).toStrictEqual({
      // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Number) is untyped by design, this is a vitest matcher.
      x_min: expect.any(Number),
      // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Number) is untyped by design, this is a vitest matcher.
      y_min: expect.any(Number),
      // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Number) is untyped by design, this is a vitest matcher.
      x_max: expect.any(Number),
      y_max: 1000,
    });
  });

  test("a view out of the base sees nothing of it", () => {
    const away = {
      ...TOP_VIEW,
      position: [5000, 5000, 100] as [number, number, number],
      focal_point: [5000, 5000, 0] as [number, number, number],
    };
    expect(visibleMapArea(away, 1, 0, BASE)).toBeUndefined();
  });

  test("ground size of a screen pixel and the detail threshold", () => {
    // 200 m over 1000 px: 0.2 m per pixel
    expect(screenPixelGroundSize(TOP_VIEW, 1000)).toBeCloseTo(0.2);
    expect(needsSharperMap(0.31, 0.2)).toBe(true);
    expect(needsSharperMap(0.29, 0.2)).toBe(false);
  });

  test("a detail map stays while the view keeps within its step", () => {
    // 1024 m over 4 tiles: 1 m per pixel
    const detail = { bounds: { x_min: 0, y_min: 0, x_max: 1024, y_max: 1024 }, columns: 4 };
    const inside = { x_min: 100, y_min: 100, x_max: 900, y_max: 900 };
    expect(stillSharp(detail, inside, 1)).toBe(true);
    // Zoomed in or out past one step
    expect(stillSharp(detail, inside, 0.5)).toBe(false);
    expect(stillSharp(detail, inside, 2)).toBe(false);
    // Panned out of the detail
    expect(stillSharp(detail, { ...inside, x_max: 1100 }, 1)).toBe(false);
  });
});
