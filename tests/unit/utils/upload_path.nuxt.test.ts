// Third party imports
import { describe, expect, test } from "vitest";

// Local imports
import { fileExtension, matchExpectedFiles, uploadPath } from "@ogw_front/utils/upload_path";

describe("upload path", () => {
  test("uses the relative path of a file dropped from a folder", () => {
    const file = Object.assign(new File(["vtu"], "rank_0.vtu"), {
      relativePath: "vtkOutput/000000/rank_0.vtu",
    });
    expect(uploadPath(file)).toBe("vtkOutput/000000/rank_0.vtu");
  });

  test("uses the name of a loose file", () => {
    expect(uploadPath(new File(["pvd"], "time_series.pvd"))).toBe("time_series.pvd");
  });

  test("gets the lower case extension", () => {
    expect(fileExtension("spe10/vtkOutput.PVD")).toBe("pvd");
  });

  describe("match expected files", () => {
    const expected = [
      "outputs/vtkOutput/000000.vtm",
      "outputs/vtkOutput/000000/block/rank_0.vtu",
      "outputs/vtkOutput/000001/block/rank_0.vtu",
    ];

    test("finds the files in a folder above them", () => {
      const selected = [
        "exports/model.og_brep",
        "exports/outputs/vtkOutput/000001/block/rank_0.vtu",
        "exports/outputs/vtkOutput/000000/block/rank_0.vtu",
        "exports/outputs/vtkOutput/000000.vtm",
      ];
      expect(matchExpectedFiles(selected, expected)).toStrictEqual({
        status: "matched",
        indices: [3, 2, 1],
      });
    });

    test("finds the files in a folder inside the referenced tree", () => {
      const selected = ["vtkOutput/000000.vtm", "vtkOutput/000000/block/rank_0.vtu"];
      expect(matchExpectedFiles(selected, expected)).toStrictEqual({
        status: "matched",
        indices: [0, 1, undefined],
      });
    });

    test("finds the files in a different layout", () => {
      const selected = ["run/000001/rank_0.vtu", "run/steps/000000.vtm", "run/000000/rank_0.vtu"];
      expect(matchExpectedFiles(selected, expected)).toStrictEqual({
        status: "matched",
        indices: [1, 2, 0],
      });
    });

    test("reports several equally matching files", () => {
      const selected = ["run1/vtkOutput/000000.vtm", "run2/vtkOutput/000000.vtm"];
      expect(matchExpectedFiles(selected, expected)).toStrictEqual({
        status: "ambiguous",
        path: "outputs/vtkOutput/000000.vtm",
      });
    });
  });
});
