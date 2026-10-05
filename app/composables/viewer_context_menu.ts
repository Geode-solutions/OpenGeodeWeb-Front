import { type MenuMetaData, useMenuStore } from "@ogw_front/stores/menu";
import type { Ref, ShallowRef } from "vue";
import type { TreeMenuPayload } from "@ogw_front/utils/treeview";
import type { ViewerIdResult } from "@ogw_front/composables/use_overlapping_picker";
import { useDataStore } from "@ogw_front/stores/data";
import { useElementSize } from "@vueuse/core";

interface ViewerUIExposed {
  get_viewer_id: (x: number, y: number) => Promise<ViewerIdResult>;
}

interface MenuTarget {
  id: string;
  meta_data: MenuMetaData;
}

async function treeMenuTarget(
  dataStore: ReturnType<typeof useDataStore>,
  payload: TreeMenuPayload,
): Promise<MenuTarget | undefined> {
  if (payload.context_type === "geode_object_type") {
    const [referenceId] = payload.targetIds;
    if (referenceId === undefined) {
      return undefined;
    }
    const referenceItem = await dataStore.item(referenceId);
    return { id: referenceId, meta_data: { ...referenceItem, targetIds: payload.targetIds } };
  }
  if (payload.context_type === "model_component") {
    return {
      id: payload.itemId,
      meta_data: {
        viewer_type: "model_component",
        geode_object_type: "component",
        modelId: payload.modelId,
        pickedComponentId: payload.itemId,
      },
    };
  }
  if (payload.context_type === "model_component_type") {
    return {
      id: payload.itemId,
      meta_data: {
        viewer_type: "model_component_type",
        geode_object_type: "type",
        modelId: payload.modelId,
        modelComponentType: payload.modelComponentType,
        targetComponentIds: payload.targetComponentIds,
      },
    };
  }
  return { id: payload.itemId, meta_data: { ...(await dataStore.item(payload.itemId)) } };
}

async function viewerMenuTarget(
  dataStore: ReturnType<typeof useDataStore>,
  pickedId: string,
  viewer_id: number | undefined,
): Promise<MenuTarget> {
  const item = await dataStore.item(pickedId);
  const meta_data: MenuMetaData = { ...item };
  if (item.viewer_type === "model" && viewer_id !== undefined) {
    const component = await dataStore.getComponentByViewerId(pickedId, viewer_id);
    if (component) {
      meta_data.pickedComponentId = component.geode_id;
    }
  }
  return { id: pickedId, meta_data };
}

export function useViewerContextMenu(
  container: Readonly<ShallowRef<HTMLElement | null>>,
  viewerUI: Readonly<ShallowRef<ViewerUIExposed | null>>,
): {
  containerWidth: Ref<number>;
  containerHeight: Ref<number>;
  openTreeMenu: (payload: TreeMenuPayload) => Promise<void>;
  openViewerMenu: (event: MouseEvent) => Promise<void>;
} {
  const menuStore = useMenuStore();
  const dataStore = useDataStore();
  const { width: containerWidth, height: containerHeight } = useElementSize(container);

  function openMenuAt(event: MouseEvent, element: HTMLElement, target: MenuTarget): void {
    const rect = element.getBoundingClientRect();
    menuStore.openMenu({
      id: target.id,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: containerWidth.value,
      height: containerHeight.value,
      top: rect.top,
      left: rect.left,
      meta_data: target.meta_data,
    });
  }

  async function openTreeMenu(payload: TreeMenuPayload): Promise<void> {
    const element = container.value;
    const target = await treeMenuTarget(dataStore, payload);
    if (element && target) {
      openMenuAt(payload.event, element, target);
    }
  }

  async function openViewerMenu(event: MouseEvent): Promise<void> {
    const element = container.value;
    const viewerComponent = viewerUI.value;
    if (!element || !viewerComponent) {
      return;
    }
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const yPicking = containerHeight.value - (event.clientY - rect.top);
    const { id: pickedId, viewer_id } = await viewerComponent.get_viewer_id(x, yPicking);
    if (pickedId === undefined) {
      return;
    }
    openMenuAt(event, element, await viewerMenuTarget(dataStore, pickedId, viewer_id));
  }

  return { containerWidth, containerHeight, openTreeMenu, openViewerMenu };
}
