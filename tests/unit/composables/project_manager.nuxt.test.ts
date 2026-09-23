// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters, eslint/max-lines
// oxlint-disable vitest/expect-expect
// oxlint-disable jest/prefer-ending-with-an-expect

// Third party imports
import {
  $fetch,
  type FetchOptions,
  type FetchRequest,
  type FetchResponse,
  type ResolvedFetchOptions,
} from "ofetch";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { exportProject, importProject } from "@ogw_front/composables/project_manager";
import type { api_fetch as apiFetchType } from "@ogw_internal/utils/api_fetch";
import { appMode } from "@ogw_shared/app_mode";
import backSchemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { setupActivePinia } from "@ogw_tests/utils";

vi.mock(import("ofetch"), () => ({
  $fetch: Object.assign(vi.fn(), {
    raw: vi.fn(),
    native: vi.fn(),
    create: vi.fn(),
  }),
}));

const mockedFetch = vi.mocked($fetch);

// Constants
const PANEL_WIDTH = 300;
const Z_SCALE = 1.5;
const FOCAL_POINT1 = 1;
const FOCAL_POINT2 = 2;
const FOCAL_POINT3 = 3;
const FOCAL_POINT = [FOCAL_POINT1, FOCAL_POINT2, FOCAL_POINT3];
const VIEW_UP1 = 0;
const VIEW_UP2 = 1;
const VIEW_UP3 = 0;
const VIEW_UP = [VIEW_UP1, VIEW_UP2, VIEW_UP3];
const POSITION1 = 10;
const POSITION2 = 11;
const POSITION3 = 12;
const POSITION = [POSITION1, POSITION2, POSITION3];
const VIEW_ANGLE = 30;
const CLIPPING_RANGE1 = 0.1;
const CLIPPING_RANGE2 = 1000;
const CLIPPING_RANGE = [CLIPPING_RANGE1, CLIPPING_RANGE2];
const POINT_SIZE = 2;
const VIEWER_CALL_COUNT = 1;

// Snapshot
const snapshotMock = {
  data: {
    items: [
      {
        id: "abc123",
        viewer_type: "mesh",
        geode_object_type: "PointSet2D",
        native_file: "native.ext",
        viewable_file: "viewable.ext",
        name: "My Data",
        binary_light_viewable: "VGxpZ2h0RGF0YQ==",
      },
    ],
  },
  treeview: {
    isAdditionnalTreeDisplayed: false,
    panelWidth: PANEL_WIDTH,
    model_id: "",
    isTreeCollection: false,
    selectedTree: undefined,
    selectionIds: [],
  },
  dataStyle: {
    styles: {
      abc123: {
        points: {
          visibility: true,
          coloring: {
            active: "color",
            color: { red: 255, green: 255, blue: 255, alpha: 1 },
            vertex: undefined,
          },
          size: POINT_SIZE,
        },
      },
    },
  },
  hybridViewer: {
    zScale: Z_SCALE,
    camera_options: {
      focal_point: FOCAL_POINT,
      view_up: VIEW_UP,
      position: POSITION,
      view_angle: VIEW_ANGLE,
      clipping_range: CLIPPING_RANGE,
    },
  },
};

const backStoreMock = {
  start_request: vi.fn(),
  stop_request: vi.fn(),
  base_url: vi.fn(() => ""),
  $reset: vi.fn(),
};
const infraStoreMock = {
  app_mode: appMode.BROWSER,
};
const viewerStoreMock = {
  ws_connect: vi.fn().mockResolvedValue(undefined),
  base_url: vi.fn(() => ""),
  request: vi.fn().mockResolvedValue(undefined),
};
const treeviewStoreMock = {
  clear: vi.fn(),
  importStores: vi.fn().mockResolvedValue(undefined),
  finalizeImportSelection: vi.fn(),
  addItem: vi.fn().mockResolvedValue(undefined),
};
const dataStoreMock = {
  clear: vi.fn(),
  registerObject: vi.fn().mockResolvedValue(undefined),
  addItem: vi.fn().mockResolvedValue(undefined),
  importStores: vi.fn().mockResolvedValue(undefined),
  isItemViewable: vi.fn().mockReturnValue(true),
};
const dataStyleStoreMock = {
  importStores: vi.fn().mockResolvedValue(undefined),
  applyAllStylesFromState: vi.fn().mockResolvedValue(undefined),
  addDataStyle: vi.fn().mockResolvedValue(undefined),
  applyDefaultStyle: vi.fn().mockResolvedValue(undefined),
};
const feedbackStoreMock = {
  add_success: vi.fn(),
  add_error: vi.fn(),
};

const viewer_call_mock_fn = vi.fn().mockResolvedValue(undefined);

interface HybridViewerSnapshot {
  zScale?: number;
  camera_options?: Record<string, unknown>;
}

const hybridViewerStoreMock = {
  clear: vi.fn(),
  initHybridViewer: vi.fn().mockResolvedValue(undefined),
  importStores: vi.fn((snapshot?: HybridViewerSnapshot) => {
    if (snapshot?.zScale !== undefined) {
      hybridViewerStoreMock.setZScaling(snapshot.zScale);
    }
    if (snapshot?.camera_options) {
      viewer_call_mock_fn({
        schema: { $id: "opengeodeweb_viewer.viewer.update_camera" },
        params: { camera_options: snapshot.camera_options },
      });
      hybridViewerStoreMock.remoteRender();
    }
  }),
  addItem: vi.fn().mockResolvedValue(undefined),
  remoteRender: vi.fn(),
  setZScaling: vi.fn(),
};

// MOCKS
// Resolves a mocked `$fetch` call's `onResponse` hook with a successful response.
// Mirrors the pattern used in tests/unit/stores/infra.nuxt.test.ts.
async function respondWithSuccess(
  options: FetchOptions | undefined,
  request: FetchRequest,
  data: unknown,
): Promise<void> {
  const onResponse = options?.onResponse;
  if (typeof onResponse !== "function") {
    return;
  }
  const response: FetchResponse<typeof data> = Object.assign(
    new Response(undefined, { status: 200 }),
    { _data: data },
  );
  const resolvedOptions: ResolvedFetchOptions = { headers: new Headers() };
  await onResponse({ request, options: resolvedOptions, response });
}

const exportProjectBlob = new Blob(["veasecontent"], { type: "application/octet-stream" });

mockedFetch.mockImplementation(async (route, options) => {
  const data =
    route === backSchemas.opengeodeweb_back.export_project.$id
      ? exportProjectBlob
      : { snapshot: snapshotMock };
  await respondWithSuccess(options, route, data);
  return data;
});
vi.mock(import("@ogw_internal/utils/viewer_call"), () => ({
  viewer_call: viewer_call_mock_fn,
}));

// Derived from the real `api_fetch` signature so the mock stays structurally honest instead of redeclaring (and risking drift from) its parameter shapes.
type ApiFetchParams = Parameters<typeof apiFetchType>[1];
type ApiFetchHandlers = Parameters<typeof apiFetchType>[2];

vi.mock(import("@ogw_internal/utils/api_fetch"), () => ({
  api_fetch: vi.fn(
    async (_microservice: unknown, _params: ApiFetchParams, options: ApiFetchHandlers = {}) => {
      const response = {
        _data: new Blob(["zipcontent"], { type: "application/zip" }),
        headers: {
          get: (k: string): string | undefined =>
            k === "new-file-name" ? "project_123.vease" : undefined,
        },
      };
      if (options.response_function) {
        await options.response_function(response);
      }
      return response;
    },
  ),
}));
vi.mock(import("js-file-download"), () => ({
  default: vi.fn((): void => undefined),
}));
vi.mock(import("@ogw_front/stores/infra") as Promise<unknown>, () => ({
  useInfraStore: (): typeof infraStoreMock => infraStoreMock,
}));
vi.mock(import("@ogw_front/stores/viewer") as Promise<unknown>, () => ({
  useViewerStore: (): typeof viewerStoreMock => viewerStoreMock,
}));
vi.mock(import("@ogw_front/stores/treeview") as Promise<unknown>, () => ({
  useTreeviewStore: (): typeof treeviewStoreMock => treeviewStoreMock,
}));
vi.mock(import("@ogw_front/stores/data") as Promise<unknown>, () => ({
  useDataStore: (): typeof dataStoreMock => dataStoreMock,
}));
vi.mock(import("@ogw_front/stores/data_style") as Promise<unknown>, () => ({
  useDataStyleStore: (): typeof dataStyleStoreMock => dataStyleStoreMock,
}));
vi.mock(import("@ogw_front/stores/hybrid_viewer") as Promise<unknown>, () => ({
  useHybridViewerStore: (): typeof hybridViewerStoreMock => hybridViewerStoreMock,
}));
vi.mock(import("@ogw_front/stores/back") as Promise<unknown>, () => ({
  useBackStore: (): typeof backStoreMock => backStoreMock,
}));
vi.mock(import("@ogw_front/stores/feedback") as Promise<unknown>, () => ({
  useFeedbackStore: (): typeof feedbackStoreMock => feedbackStoreMock,
}));
const appStoreMock = {
  exportStores: vi.fn(() => ({ projectName: "mockedProject" })),
};

vi.mock(import("@ogw_front/stores/app") as Promise<unknown>, () => ({
  useAppStore: (): typeof appStoreMock => appStoreMock,
}));

vi.stubGlobal("useAppStore", () => ({
  exportStores: vi.fn(() => ({ projectName: "mockedProject" })),
}));

const mockLockRequest = vi
  .fn()
  .mockImplementation(
    async (name: string, task: (lock: { name: string }) => unknown) => await task({ name }),
  );

// Proxies rather than spreads `navigator` so its prototype (and the private fields some getters, like `userAgent`, rely on) stays intact; only `locks` is overridden.
vi.stubGlobal(
  "navigator",
  new Proxy(navigator, {
    get(target, prop): unknown {
      if (prop === "locks") {
        return { request: mockLockRequest };
      }
      return Reflect.get(target, prop, target);
    },
  }),
);

function verifyViewerCalls(): void {
  expect(viewerStoreMock.ws_connect).toHaveBeenCalledWith();
  expect(viewer_call_mock_fn).toHaveBeenCalledTimes(VIEWER_CALL_COUNT);
}

function verifyStoreImports(): void {
  expect(treeviewStoreMock.importStores).toHaveBeenCalledWith(snapshotMock.treeview);
  expect(dataStoreMock.importStores).toHaveBeenCalledWith(snapshotMock.data);
  expect(hybridViewerStoreMock.initHybridViewer).toHaveBeenCalledWith();
  expect(hybridViewerStoreMock.importStores).toHaveBeenCalledWith(snapshotMock.hybridViewer);
  expect(hybridViewerStoreMock.setZScaling).toHaveBeenCalledWith(Z_SCALE);
}

function verifyDataManagement(): void {
  expect(dataStyleStoreMock.importStores).toHaveBeenCalledWith(snapshotMock.dataStyle);
  expect(dataStyleStoreMock.applyAllStylesFromState).toHaveBeenCalledWith();
  expect(dataStoreMock.registerObject).toHaveBeenCalledWith("abc123", "My Data");
  expect(dataStoreMock.addItem).toHaveBeenCalledWith(snapshotMock.data.items[0]);
  expect(treeviewStoreMock.addItem).toHaveBeenCalledWith("PointSet2D", "My Data", "abc123", "mesh");
}

function verifyRemaining(): void {
  expect(hybridViewerStoreMock.addItem).toHaveBeenCalledWith("abc123");
  expect(dataStyleStoreMock.addDataStyle).toHaveBeenCalledWith("abc123", "PointSet2D");
  expect(dataStyleStoreMock.applyDefaultStyle).toHaveBeenCalledWith("abc123");
  expect(hybridViewerStoreMock.remoteRender).toHaveBeenCalledWith();
  expect(feedbackStoreMock.add_success).toHaveBeenCalledWith("Project imported successfully");
}

describe("projectManager composable (compact)", () => {
  beforeEach(() => {
    setupActivePinia();
    // oxlint-disable-next-line eslint/id-length -- mirrors the real ofetch/vitest API field name (`ok`/`fn`)
    const storesList: Record<string, ReturnType<typeof vi.fn>>[] = [
      viewerStoreMock,
      treeviewStoreMock,
      dataStoreMock,
      dataStyleStoreMock,
      hybridViewerStoreMock,
      feedbackStoreMock,
    ];
    for (const store of storesList) {
      const values = Object.values(store);
      for (const value of values) {
        if (typeof value === "function" && typeof value.mockClear === "function") {
          value.mockClear();
        }
      }
    }
    viewer_call_mock_fn.mockClear();
  });

  test("exportProject", async () => {
    const { default: fileDownload } = await import("js-file-download");

    await exportProject();

    expect(fileDownload).toHaveBeenCalledWith(exportProjectBlob, "project.vease");
    expect(feedbackStoreMock.add_success).toHaveBeenCalledWith("Project exported successfully");
  });

  test("importProjectFile with snapshot - Viewer and Stores", async () => {
    const file = new File(['{"dataBase":{"db":{}}}'], "project.vease", {
      type: "application/json",
    });

    await importProject(file);

    verifyViewerCalls();
    verifyStoreImports();
  });

  test("importProjectFile with snapshot - Data and Rendering", async () => {
    const file = new File(['{"dataBase":{"db":{}}}'], "project.vease", {
      type: "application/json",
    });

    await importProject(file);

    verifyDataManagement();
    verifyRemaining();
  });
});
