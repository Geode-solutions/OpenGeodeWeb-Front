import CameraBookmarkIcon from "@ogw_front/assets/viewer_svgs/camera-bookmark.svg";
import type { ViewToolbarTools } from "@ogw_front/composables/view_toolbar_tools";

interface CameraOptionAction {
  title?: string;
  testId: string;
  tooltip?: string;
  icon: string;
  iconSize?: number;
  color?: string;
  action?: () => void;
  menu?: CameraOptionAction[];
}

// The buttons opening a panel
function panelOptions(tools: ViewToolbarTools): CameraOptionAction[] {
  return [
    {
      testId: "cameraOrientationButton",
      tooltip: "Camera orientation",
      icon: "ph-arrows-clockwise",
      action: (): void => {
        tools.toggleTool(tools.showCameraOrientation);
      },
    },
    {
      testId: "cameraManagerButton",
      tooltip: "Manage camera positions",
      icon: CameraBookmarkIcon,
      iconSize: 34,
      action: (): void => {
        tools.toggleTool(tools.showCameraManager);
      },
    },
    {
      testId: "screenshotButton",
      tooltip: "Take a screenshot",
      icon: "ph-camera",
      action: (): void => {
        tools.toggleTool(tools.showScreenshot);
      },
    },
  ];
}

// The buttons opening the scene controls
function controlOptions(tools: ViewToolbarTools): CameraOptionAction[] {
  return [
    {
      testId: "zScalingButton",
      tooltip: "Z Scaling Control",
      icon: "ph-arrows-down-up",
      action: (): void => {
        tools.toggleTool(tools.showZScaling);
      },
    },
    {
      testId: "clippingPlanesButton",
      tooltip: "Clipping Planes",
      icon: "ph-scissors",
      color: tools.showClippingPlanes.value ? "primary" : undefined,
      action: (): void => {
        tools.toggleTool(tools.showClippingPlanes);
      },
    },
  ];
}

// The buttons opening the filters
function filterOptions(tools: ViewToolbarTools): CameraOptionAction[] {
  return [
    {
      testId: "shrinkFilterButton",
      tooltip: "Shrink Filter",
      icon: "ph-arrows-in",
      color: tools.showShrinkFilter.value ? "primary" : undefined,
      action: (): void => {
        tools.toggleTool(tools.showShrinkFilter);
      },
    },
    {
      testId: "explodeFilterButton",
      tooltip: "Exploded View",
      icon: "ph-arrows-out",
      color: tools.showExplodeFilter.value ? "primary" : undefined,
      action: (): void => {
        tools.toggleTool(tools.showExplodeFilter);
      },
    },
    {
      testId: "thresholdFilterButton",
      tooltip: "Threshold Filter",
      icon: "ph-funnel-simple",
      color: tools.showThresholdFilter.value ? "primary" : undefined,
      action: (): void => {
        tools.toggleTool(tools.showThresholdFilter);
      },
    },
  ];
}

function rulerOption(tools: ViewToolbarTools): CameraOptionAction {
  return {
    testId: "rulerButton",
    tooltip: "Ruler",
    icon: "ph-ruler",
    color: tools.showRuler.value ? "primary" : undefined,
    action: (): void => {
      tools.toggleTool(tools.showRuler);
    },
  };
}

export { controlOptions, filterOptions, panelOptions, rulerOption };
export type { CameraOptionAction };
