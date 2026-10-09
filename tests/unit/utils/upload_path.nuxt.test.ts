// Third party imports
import { describe, expect, test } from "vitest";

// Local imports
import {
  alignOnExpectedFiles,
  fileExtension,
  joinUploadPath,
  uploadDirectory,
  uploadPath,
} from "@ogw_front/utils/upload_path";

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

  test("splits and joins directories", () => {
    expect(uploadDirectory("spe10/vtkOutput.pvd")).toBe("spe10");
    expect(uploadDirectory("vtkOutput.pvd")).toBe("");
    expect(joinUploadPath("spe10", "vtkOutput/000000.vtm")).toBe("spe10/vtkOutput/000000.vtm");
    expect(joinUploadPath("", "vtkOutput/000000.vtm")).toBe("vtkOutput/000000.vtm");
    expect(fileExtension("spe10/vtkOutput.PVD")).toBe("pvd");
  });

  describe("align on expected files", () => {
    const expected = ["vtkOutput/000000.vtm", "vtkOutput/000060.vtm"];
    const tree = [
      "vtkOutput/000000.vtm",
      "vtkOutput/000060.vtm",
      "vtkOutput/000000/reservoir/rank_0.vtu",
    ];

    test("keeps the paths of the exact folder", () => {
      expect(alignOnExpectedFiles(tree, expected)).toStrictEqual({
        status: "aligned",
        paths: tree,
      });
    });

    test("finds the expected files in a folder several levels above", () => {
      const selected = [
        "exports/spe10/model.og_brep",
        ...tree.map((path) => `exports/spe10/${path}`),
      ];
      expect(alignOnExpectedFiles(selected, expected)).toStrictEqual({
        status: "aligned",
        paths: [undefined, ...tree],
      });
    });

    test("keeps flat expected files", () => {
      expect(alignOnExpectedFiles(["run/a.vtu", "run/b.txt"], ["a.vtu"])).toStrictEqual({
        status: "aligned",
        paths: ["a.vtu", undefined],
      });
    });

    test("reports a folder without the expected files", () => {
      expect(alignOnExpectedFiles(["other/x.vtu"], expected)).toStrictEqual({
        status: "not_found",
      });
    });

    test("reports several matching exports", () => {
      const selected = [
        ...tree.map((path) => `run1/${path}`),
        ...tree.map((path) => `run2/${path}`),
      ];
      expect(alignOnExpectedFiles(selected, expected)).toStrictEqual({ status: "ambiguous" });
    });
  });
});
