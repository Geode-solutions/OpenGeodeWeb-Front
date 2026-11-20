import { describe, expect, test, vi } from "vitest";

import {
  MIN_COMPASS_TILT,
  compassDialPoint,
  compassHeading,
  isFacing,
} from "@ogw_front/utils/orientation_compass";
import {
  ORIGIN,
  RADIUS,
  basisOf,
  facingFrom,
  headingFrom,
  labelsFrom,
  northUpFrom,
  pose,
  tiltFrom,
} from "@ogw_tests/unit/helpers/orientation_gizmo";
import { type Vec3, cameraViewBasis, toCameraPose } from "@ogw_front/utils/orientation_gizmo";
import {
  cameraElevation,
  latitudeRing,
  northPoint,
  orientationReadout,
} from "@ogw_front/utils/orientation_globe";
import { strataOpacity, visibleHeight } from "@ogw_front/utils/orientation_strata";

vi.setConfig({ testTimeout: 10_000 });

const LABEL_DISTANCE = 41;
const QUARTER_TURN = 90;
const ISO_HEADING = 30;
const ISO_ELEVATION = 25;
const FLAT = 1e-6;
const HALF_TURN = 180;
const LETTER_RADIUS = 26;
const HALF_TILT = 0.5;
const UPPER_STRATUM = 0.9;
const MIDDLE_STRATUM = 0.3;
const DISTANCE = 10;
const PRECISION = 6;
const EAST_HEADING = 90;
const WEST_HEADING = -90;
const WEST_TARGET_HEADING = 270;
const FULL_TURN = 360;
const ELEVATION_HEIGHT = 5;
const UP_X: Vec3 = [1, 0, 0];
const UP_Y: Vec3 = [0, 1, 0];
const UP_Z: Vec3 = [0, 0, 1];
const ABOVE: Vec3 = [0, 0, DISTANCE];
const SOUTH: Vec3 = [0, -DISTANCE, 0];
const EAST: Vec3 = [DISTANCE, 0, 0];
const WEST: Vec3 = [-DISTANCE, 0, 0];

describe("orientation gizmo projection", () => {
  test("reads a camera pose from the camera options", () => {
    const options = { position: ABOVE, focal_point: ORIGIN, view_up: UP_Y };
    expect(toCameraPose(options)).toStrictEqual(options);
    expect(toCameraPose({})).toBeUndefined();
    expect(toCameraPose({ ...options, position: [0, 0] })).toBeUndefined();
  });

  test("a degenerate camera has no view basis", () => {
    expect(cameraViewBasis(pose(ORIGIN, UP_Z))).toBeUndefined();
    expect(cameraViewBasis(pose(ABOVE, UP_Z))).toBeUndefined();
  });

  test("seen from +Z with Y up, X labels right and Y up on screen", () => {
    const labels = Object.fromEntries(labelsFrom(ABOVE, UP_Y).map((label) => [label.key, label]));
    expect(labels.xplus?.x).toBeCloseTo(LABEL_DISTANCE, PRECISION);
    // SVG y grows downwards
    expect(labels.yplus?.y).toBeCloseTo(-LABEL_DISTANCE, PRECISION);
    // Z points at the viewer: its label sits next to the center
    expect(labels.zplus?.foreshortened).toBe(true);
  });

  test("draws the labels back to front", () => {
    const keys = labelsFrom(EAST, UP_Z).map((label) => label.key);
    expect(keys.at(-1)).toBe("xplus");
  });
});

describe("orientation globe strata", () => {
  test("seen from the side, the equator is a horizontal line", () => {
    const ring = latitudeRing(basisOf(pose(SOUTH, UP_Z)), RADIUS, 0);
    const heights = [...ring.front.matchAll(/[ML](?<x>[-\d.]+) (?<y>[-\d.]+)/gu)].map((match) =>
      Number(match.groups?.y),
    );
    expect(heights.length).toBeGreaterThan(0);
    expect(heights.every((height) => Math.abs(height) < FLAT)).toBe(true);
  });

  test("reads the world height under the screen, top and side views", () => {
    const fromAbove = basisOf(pose(ABOVE, UP_Y));
    const fromSouth = basisOf(pose(SOUTH, UP_Z));
    // From above, the center of the globe is its north pole
    expect(visibleHeight(fromAbove, 0, 0)).toBeCloseTo(1, PRECISION);
    // From the side, the top of the globe is its north pole
    expect(visibleHeight(fromSouth, 0, -1)).toBeCloseTo(1, PRECISION);
    expect(visibleHeight(fromSouth, 1, 1)).toBeUndefined();
  });

  test("alternates filled and clear strata", () => {
    expect(strataOpacity(UPPER_STRATUM)).toBeGreaterThan(0);
    expect(strataOpacity(MIDDLE_STRATUM)).toBe(0);
    expect(strataOpacity(-MIDDLE_STRATUM)).toBeGreaterThan(0);
    expect(strataOpacity(-UPPER_STRATUM)).toBe(0);
  });

  test("puts the north on the equator, at +Y", () => {
    const north = northPoint(basisOf(pose(ABOVE, UP_Y)), RADIUS);
    expect(north.x).toBeCloseTo(0, PRECISION);
    expect(north.y).toBeCloseTo(-RADIUS, PRECISION);
  });

  test("reads the view as azimuth and elevation", () => {
    const fromAbove = basisOf(pose(ABOVE, UP_Y));
    const fromSouth = basisOf(pose(SOUTH, UP_Z));
    expect(cameraElevation(fromAbove)).toBeCloseTo(QUARTER_TURN, PRECISION);
    expect(cameraElevation(fromSouth)).toBeCloseTo(0, PRECISION);
    expect(orientationReadout(ISO_HEADING, ISO_ELEVATION)).toBe("N 030° · 25°");
    expect(orientationReadout(WEST_HEADING, 0)).toBe("N 270° · 0°");
  });
});

describe("orientation compass heading", () => {
  test("looking north, east and west from the side", () => {
    expect(headingFrom(SOUTH, UP_Z)).toBeCloseTo(0, PRECISION);
    expect(headingFrom(WEST, UP_Z)).toBeCloseTo(EAST_HEADING, PRECISION);
    expect(headingFrom(EAST, UP_Z)).toBeCloseTo(WEST_HEADING, PRECISION);
  });

  test("stays defined looking straight down, from the screen up direction", () => {
    expect(headingFrom(ABOVE, UP_Y)).toBeCloseTo(0, PRECISION);
    // East up on screen: the camera "looks" east
    expect(headingFrom(ABOVE, UP_X)).toBeCloseTo(EAST_HEADING, PRECISION);
  });

  test("has no heading when the camera is rolled until its right is vertical", () => {
    expect(headingFrom(SOUTH, UP_X)).toBeUndefined();
  });

  test("flattens the dial with the elevation", () => {
    expect(tiltFrom(ABOVE, UP_Y)).toBeCloseTo(1, PRECISION);
    expect(tiltFrom(SOUTH, UP_Z)).toBe(MIN_COMPASS_TILT);
  });

  test("places the dial letters once turned and flattened", () => {
    const north = compassDialPoint(0, LETTER_RADIUS, 0, HALF_TILT);
    expect(north.x).toBeCloseTo(0, PRECISION);
    expect(north.y).toBeCloseTo(-LETTER_RADIUS * HALF_TILT, PRECISION);
    // Looking east, north is on the left
    const turnedNorth = compassDialPoint(0, LETTER_RADIUS, EAST_HEADING, 1);
    expect(turnedNorth.x).toBeCloseTo(-LETTER_RADIUS, PRECISION);
    expect(turnedNorth.y).toBeCloseTo(0, PRECISION);
    const south = compassDialPoint(HALF_TURN, LETTER_RADIUS, 0, 1);
    expect(south.y).toBeCloseTo(LETTER_RADIUS, PRECISION);
  });

  test("turns the camera to face north, keeping its elevation and distance", () => {
    const northUp = northUpFrom([-DISTANCE, 0, ELEVATION_HEIGHT], UP_Z);
    expect(northUp.position[0]).toBeCloseTo(0, PRECISION);
    expect(northUp.position[1]).toBeCloseTo(-DISTANCE, PRECISION);
    expect(northUp.position[2]).toBeCloseTo(ELEVATION_HEIGHT, PRECISION);
    expect(compassHeading(basisOf(northUp))).toBeCloseTo(0, PRECISION);
  });

  test("turns the camera to face any heading, keeping its elevation and distance", () => {
    const facingWest = facingFrom([-DISTANCE, 0, ELEVATION_HEIGHT], UP_Z, WEST_TARGET_HEADING);
    expect(facingWest.position[0]).toBeCloseTo(DISTANCE, PRECISION);
    expect(facingWest.position[1]).toBeCloseTo(0, PRECISION);
    expect(facingWest.position[2]).toBeCloseTo(ELEVATION_HEIGHT, PRECISION);
    expect(compassHeading(basisOf(facingWest))).toBeCloseTo(WEST_HEADING, PRECISION);
  });

  test("tells whether the camera already faces a heading", () => {
    const lookingEast = basisOf(pose([-DISTANCE, 0, ELEVATION_HEIGHT], UP_Z));
    expect(isFacing(lookingEast, EAST_HEADING)).toBe(true);
    expect(isFacing(lookingEast, EAST_HEADING + FULL_TURN)).toBe(true);
    expect(isFacing(lookingEast, 0)).toBe(false);
  });

  test("turns a top view so that north is up", () => {
    const northUp = northUpFrom(ABOVE, UP_X);
    expect(northUp.view_up[0]).toBeCloseTo(0, PRECISION);
    expect(northUp.view_up[1]).toBeCloseTo(1, PRECISION);
    expect(northUp.position[2]).toBeCloseTo(DISTANCE, PRECISION);
  });
});
