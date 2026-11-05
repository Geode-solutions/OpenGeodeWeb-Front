import { beforeEach, describe, expect, test } from "vitest";
import { setupActivePinia } from "@ogw_tests/utils";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useMeshStyle } from "@ogw_internal/stores/data_style/mesh/index";

const MESH_ID = "mesh-1";

describe("mesh style", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("applying a style holding only its data_id applies nothing", async () => {
    await useDataStyleState().mutateStyle(MESH_ID, {});

    await expect(useMeshStyle().applyMeshStyle(MESH_ID)).resolves.toStrictEqual([]);
  });
});
