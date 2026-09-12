import { dot } from "@kitware/vtk.js/Common/Core/Math";
import type { CameraOptions, Vector3, vtkCamera } from "./vtk_types";

const NEAR_ZERO_THRESHOLD = 1e-10;
const SLERP_LINEAR_THRESHOLD = 0.9995;
const LONG_ANIMATION_DURATION = 1000;
const SHORT_ANIMATION_DURATION = 500;
const MID_ANIMATION_RATIO = 0.5;

function vecSub(vector: Vector3, other: Vector3): Vector3 {
  return [vector[0] - other[0], vector[1] - other[1], vector[2] - other[2]];
}

function vecLength(vector: Vector3): number {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function vecNormalize(vector: Vector3): Vector3 {
  const len = vecLength(vector);
  if (len < NEAR_ZERO_THRESHOLD) {
    return [0, 0, 1];
  }
  return [vector[0] / len, vector[1] / len, vector[2] / len];
}

function slerp(from: Vector3, target: Vector3, ratio: number, mid?: Vector3): Vector3 {
  const normFrom = vecNormalize(from);
  const normTarget = vecNormalize(target);
  let dotProduct =
    normFrom[0] * normTarget[0] + normFrom[1] * normTarget[1] + normFrom[2] * normTarget[2];
  dotProduct = Math.max(-1, Math.min(1, dotProduct));
  if (dotProduct > SLERP_LINEAR_THRESHOLD) {
    return vecNormalize([
      normFrom[0] + (normTarget[0] - normFrom[0]) * ratio,
      normFrom[1] + (normTarget[1] - normFrom[1]) * ratio,
      normFrom[2] + (normTarget[2] - normFrom[2]) * ratio,
    ]);
  }
  if (dotProduct < -SLERP_LINEAR_THRESHOLD && mid) {
    return ratio < MID_ANIMATION_RATIO
      ? slerp(normFrom, mid, ratio * 2)
      : slerp(mid, normTarget, (ratio - MID_ANIMATION_RATIO) * 2);
  }
  const theta = Math.acos(dotProduct);
  const sinTheta = Math.sin(theta);
  const weightFrom = Math.sin((1 - ratio) * theta) / sinTheta;
  const weightTarget = Math.sin(ratio * theta) / sinTheta;
  return [
    normFrom[0] * weightFrom + normTarget[0] * weightTarget,
    normFrom[1] * weightFrom + normTarget[1] * weightTarget,
    normFrom[2] * weightFrom + normTarget[2] * weightTarget,
  ];
}

function computeAnimationDuration(startState: CameraOptions, targetState: CameraOptions): number {
  const startDir = vecNormalize(vecSub(startState.position, startState.focal_point));
  const targetDir = vecNormalize(vecSub(targetState.position, targetState.focal_point));
  const dotProduct = Math.max(-1, Math.min(1, dot(startDir, targetDir)));
  const angle = Math.acos(dotProduct);
  const angleRatio = angle / Math.PI;
  return (
    SHORT_ANIMATION_DURATION + (LONG_ANIMATION_DURATION - SHORT_ANIMATION_DURATION) * angleRatio
  );
}

interface AnimateCameraOptions {
  camera: vtkCamera;
  startState: CameraOptions;
  targetState: CameraOptions;
  duration: number;
  bumpMultiplier: number;
  easeExponent: number;
  onUpdate: () => void;
  onEnd: () => void;
}

function animateCamera(options: AnimateCameraOptions): void {
  const {
    camera,
    startState,
    targetState,
    duration,
    bumpMultiplier,
    easeExponent,
    onUpdate,
    onEnd,
  } = options;
  const startDir = vecSub(startState.position, startState.focal_point);
  const targetDir = vecSub(targetState.position, targetState.focal_point);
  const startDist = vecLength(startDir);
  const targetDist = vecLength(targetDir);

  const normStart = vecNormalize(startDir);
  const normTarget = vecNormalize(targetDir);
  const startTargetDot =
    normStart[0] * normTarget[0] + normStart[1] * normTarget[1] + normStart[2] * normTarget[2];

  let antipodalMid: Vector3 | undefined = undefined;
  if (startTargetDot < -SLERP_LINEAR_THRESHOLD) {
    const normUp = vecNormalize(startState.view_up);
    antipodalMid = vecNormalize([
      normStart[1] * normUp[2] - normStart[2] * normUp[1],
      normStart[2] * normUp[0] - normStart[0] * normUp[2],
      normStart[0] * normUp[1] - normStart[1] * normUp[0],
    ]);
  }

  const startTime = performance.now();
  function animate(currentTime: number): void {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const ease =
      duration > SHORT_ANIMATION_DURATION
        ? 1 - (1 - progress) ** easeExponent
        : progress * (2 - progress);
    const bump = bumpMultiplier * Math.sin(Math.PI * progress);
    const dir = slerp(startDir, targetDir, ease, antipodalMid);
    const dist = startDist + (targetDist - startDist) * ease + bump;
    // `index` ranges over startState.focal_point's own length (3), which always
    // Matches targetState.focal_point's length, so the lookup is always in bounds.
    const focalPoint = startState.focal_point.map(
      (startValue, index) => startValue + (targetState.focal_point[index]! - startValue) * ease,
    );
    const viewUp = slerp(startState.view_up, targetState.view_up, ease);
    camera.set({
      // Same reasoning: `index` ranges over focalPoint's length, matching `dir`'s length (3).
      position: focalPoint.map((focalCoord, index) => focalCoord + dir[index]! * dist),
      viewUp,
      focalPoint,
    });
    onUpdate();
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      onEnd();
    }
  }
  requestAnimationFrame(animate);
}

export {
  LONG_ANIMATION_DURATION,
  SHORT_ANIMATION_DURATION,
  animateCamera,
  computeAnimationDuration,
};
