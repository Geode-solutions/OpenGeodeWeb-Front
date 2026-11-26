// Third party imports
import { type Mock, vi } from "vitest";
import type { GeodeImageType } from "@geode/opengeodeweb-microservice/data_types";

// Local imports
import { mockAs } from "@ogw_tests/utils";
import { useDataStore } from "@ogw_front/stores/data";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

interface SentRequest {
  schema: unknown;
  params: unknown;
}

interface Callbacks {
  response_function?: () => Promise<unknown>;
}

type Request = (request: SentRequest, callbacks?: Callbacks) => Promise<unknown>;

const IMAGE_TYPES: readonly GeodeImageType[] = ["RasterImage2D", "RasterImage3D"];

// The viewer answers every request: the response function then runs as it would after a real answer
function mockViewer(): Mock<Request> {
  const viewerStore = useViewerStore();
  const request = vi.fn<Request>(async (_request, callbacks = {}) => {
    const result = await callbacks.response_function?.();
    return result;
  });
  viewerStore.request = mockAs<typeof viewerStore.request>(request);
  return request;
}

function sentRequests(request: Mock<Request>): SentRequest[] {
  return request.mock.calls.map(([sent]) => sent);
}

function mockHybridVisibility(): Mock<(dataId: string, visibility: boolean) => void> {
  const hybridViewerStore = useHybridViewerStore();
  const setVisibility = vi.fn<(dataId: string, visibility: boolean) => void>();
  hybridViewerStore.setVisibility = mockAs<typeof hybridViewerStore.setVisibility>(setVisibility);
  return setVisibility;
}

// Only the given image is viewable: the styles of the other tests stay in the database
function mockImageItem(imageId: string, geode_object_type: GeodeImageType): void {
  const dataStore = useDataStore();
  const image = { data_id: imageId, viewer_object_type: "image", geode_object_type };
  dataStore.item = mockAs<typeof dataStore.item>(
    vi.fn(async (dataId: string) => {
      await Promise.resolve();
      if (dataId === imageId) {
        return image;
      }
      return { data_id: dataId, is_viewable: false };
    }),
  );
  dataStore.fetchIsViewable = mockAs<typeof dataStore.fetchIsViewable>(
    vi.fn(async (dataId: string) => {
      await Promise.resolve();
      return dataId === imageId;
    }),
  );
}

export { IMAGE_TYPES, mockHybridVisibility, mockImageItem, mockViewer, sentRequests };
