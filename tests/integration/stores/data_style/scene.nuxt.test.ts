// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { getDefaultSceneStyle } from "@ogw_front/utils/default_styles";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const viewer_viewer_schemas = viewer_schemas.opengeodeweb_viewer.viewer;
const file_name = "test.og_edc3d";
const geode_object = "EdgedCurve3D";
const RED = 255;
const BLUE = 255;
const HALF = 0.5;

let projectFolderPath = "";

describe("scene style", () => {
  beforeAll(async () => {
    ({ projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    await cleanupBackend(projectFolderPath);
  });

  test("scene text color", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    const color = { red: RED, green: 0, blue: 0, alpha: 1 };
    const spy = vi.spyOn(viewerStore, "request");
    await dataStyleStore.setSceneTextColor(color);
    expect(spy).toHaveBeenCalledWith(
      {
        schema: viewer_viewer_schemas.set_text_style,
        // oxlint-disable-next-line id-length -- the viewer schema requires { r, g, b }
        params: { color: { r: RED, g: 0, b: 0 }, font_family: "arial", opacity: 1 },
      },
      {
        // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
        response_function: expect.any(Function),
      },
    );
    expect(dataStyleStore.sceneStyle.text.color).toStrictEqual(color);
  });

  test("quick text changes keep both values", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    const color = { red: 0, green: 0, blue: BLUE, alpha: HALF };
    const spy = vi.spyOn(viewerStore, "request");
    await Promise.all([
      dataStyleStore.setSceneTextColor(color),
      dataStyleStore.setSceneFontFamily("courier"),
    ]);
    expect(spy).toHaveBeenLastCalledWith(
      {
        schema: viewer_viewer_schemas.set_text_style,
        // oxlint-disable-next-line id-length -- the viewer schema requires { r, g, b }
        params: { color: { r: 0, g: 0, b: BLUE }, font_family: "courier", opacity: HALF },
      },
      {
        // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
        response_function: expect.any(Function),
      },
    );
    expect(dataStyleStore.sceneStyle.text).toStrictEqual({ color, font_family: "courier" });
  });

  test("scene orientation widget", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    const spy = vi.spyOn(viewerStore, "request");
    await dataStyleStore.setSceneOrientationWidget("compass");
    expect(spy).toHaveBeenCalledWith(
      { schema: viewer_viewer_schemas.set_orientation_widget, params: { marker: "compass" } },
      {
        // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
        response_function: expect.any(Function),
      },
    );
    expect(dataStyleStore.sceneStyle.orientation_widget).toBe("compass");
  });

  test("export then import scene style", async () => {
    const dataStyleStore = useDataStyleStore();
    await dataStyleStore.setSceneFontFamily("times");
    // A saved project goes through JSON, which strips the live reactive proxies
    // oxlint-disable-next-line unicorn/prefer-structured-clone, no-unsafe-type-assertion -- JSON round-trip of a known-shape snapshot.
    const snapshot = JSON.parse(JSON.stringify(dataStyleStore.exportStores())) as ReturnType<
      typeof dataStyleStore.exportStores
    >;
    await dataStyleStore.importStores({ ...snapshot, sceneStyle: undefined });
    expect(dataStyleStore.sceneStyle).toStrictEqual(getDefaultSceneStyle());
    await dataStyleStore.importStores(snapshot);
    expect(dataStyleStore.sceneStyle.text.font_family).toBe("times");
  });
});
