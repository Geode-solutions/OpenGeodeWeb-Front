// Third party imports
import { describe, expect, test } from "vitest";
import path from "node:path";
import { readFileSync } from "node:fs";
import type vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";
import { newInstance as vtkXMLPolyDataReader } from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

// Local imports
import { base64ToArrayBuffer } from "@ogw_internal/stores/hybrid_viewer/base64";

// CONSTANTS
const NON_UTF8_BYTES = Buffer.from("C000FF802440", "hex");
const CUBE_POINTS = 8;
const CUBE_LINES = 12;
const FIXTURE_PATH = path.resolve(import.meta.dirname, "..", "data", "light_viewable_binary.vtp");

describe("light viewable base64 decoding", () => {
  test("round-trips bytes that are not valid UTF-8", () => {
    const b64 = NON_UTF8_BYTES.toString("base64");
    const result = new Uint8Array(base64ToArrayBuffer(b64));
    expect(result).toStrictEqual(new Uint8Array(NON_UTF8_BYTES));
  });

  test("returns an empty buffer for an empty string", () => {
    expect(base64ToArrayBuffer("").byteLength).toBe(0);
  });

  test("rejects legacy plain XML (no backward compatibility)", () => {
    expect(() => base64ToArrayBuffer('<?xml version="1.0"?>')).toThrow(/character/iu);
  });

  test("decoded binary light viewable is parsed by vtk.js", () => {
    const fileBytes = readFileSync(FIXTURE_PATH);
    const buffer = base64ToArrayBuffer(fileBytes.toString("base64"));
    expect(new Uint8Array(buffer)).toStrictEqual(new Uint8Array(fileBytes));

    const reader = vtkXMLPolyDataReader();
    reader.parseAsArrayBuffer(buffer);
    // oxlint-disable-next-line no-unsafe-type-assertion -- vtk.js's algorithm interface types getOutputData as `any`; this reader always produces polydata.
    const polydata = reader.getOutputData(0) as unknown as vtkPolyData;
    expect(polydata.getNumberOfPoints()).toBe(CUBE_POINTS);
    expect(polydata.getLines().getNumberOfCells()).toBe(CUBE_LINES);
  });
});
