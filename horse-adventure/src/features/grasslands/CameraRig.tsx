import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, type RefObject } from "react";
import { Group, PerspectiveCamera, Vector3 } from "three";
import type { CameraMode, CameraOverride } from "./types";

export function CameraRig({ horseRef, mode, override = null }: { horseRef: RefObject<Group | null>; mode: CameraMode; override?: CameraOverride | null }) {
  const { camera } = useThree();
  const overviewPosition = useMemo(() => new Vector3(0, 14, 42), []);
  const overviewTarget = useMemo(() => new Vector3(0, 0, 0), []);
  const cameraPosition = useMemo(() => new Vector3(), []);
  const lookTarget = useMemo(() => new Vector3(), []);
  const cinematicTarget = useMemo(() => new Vector3(), []);
  const cinematicDirection = useMemo(() => new Vector3(), []);
  const riderEyeHeight = 2.4;
  const riderBackOffset = 1.7;
  const riderLookDistance = 12;
  const firstPersonHeight = 2.85;
  const firstPersonForwardOffset = 0.95;
  const firstPersonLookDistance = 14;
  const firstPersonFov = 72;
  const maxCinematicYawOffset = Math.PI / 6;
  const preferredShoulderYawOffset = Math.PI / 12;

  useFrame((_, delta) => {
    if (!(camera instanceof PerspectiveCamera)) {
      return;
    }

    const smoothing = 1 - Math.exp(-delta * 5);

    if (override?.kind === "cinematic" && horseRef.current) {
      const horse = horseRef.current;
      const heading = horse.rotation.y;
      const baseYaw = -heading;
      const dx = override.targetPosition[0] - horse.position.x;
      const dz = override.targetPosition[2] - horse.position.z;
      const desiredYaw = Math.atan2(dx, -dz);
      let yawDelta = desiredYaw - baseYaw;

      while (yawDelta > Math.PI) yawDelta -= Math.PI * 2;
      while (yawDelta < -Math.PI) yawDelta += Math.PI * 2;

      const shoulderYaw = Math.max(-maxCinematicYawOffset, Math.min(maxCinematicYawOffset, yawDelta + preferredShoulderYawOffset));
      const cinematicYaw = baseYaw + shoulderYaw;
      const forwardX = Math.sin(cinematicYaw);
      const forwardZ = -Math.cos(cinematicYaw);
      const horseFace = new Vector3(
        horse.position.x + Math.cos(heading) * 1.35,
        horse.position.y + 2.2,
        horse.position.z - Math.sin(heading) * 1.35,
      );
      const creatureFocusHeight = override.actor === "snake"
        ? 0.35
        : override.actor === "mouse"
          ? 0.52
          : override.actor === "robin" || override.actor === "cardinal"
            ? 0.75
            : 0.9;

      cinematicTarget.set(
        (horseFace.x + override.targetPosition[0]) * 0.5,
        (horseFace.y + override.targetPosition[1] + creatureFocusHeight) * 0.5 - 1.1,
        (horseFace.z + override.targetPosition[2]) * 0.5,
      );
      const targetDistance = Math.hypot(dx, dz);
      const cameraDistance = Math.max(7, Math.min(9.8, targetDistance * 0.64 + 4.1));
      const cameraHeight = Math.max(horse.position.y + 5.4, cinematicTarget.y + 2.2);

      cinematicDirection.set(forwardX, 0, forwardZ);
      cameraPosition.set(
        horseFace.x - cinematicDirection.x * cameraDistance - forwardZ * 0.8,
        cameraHeight,
        horseFace.z - cinematicDirection.z * cameraDistance + forwardX * 0.8,
      );
      lookTarget.copy(cinematicTarget);
      camera.fov += (50 - camera.fov) * smoothing;
      camera.position.lerp(cameraPosition, smoothing);
      camera.updateProjectionMatrix();
      camera.lookAt(lookTarget);
      return;
    }

    if ((mode === "follow" || mode === "firstPerson") && horseRef.current) {
      const horse = horseRef.current;
      const heading = horse.rotation.y;
      const forwardX = Math.cos(heading);
      const forwardZ = -Math.sin(heading);

      if (mode === "firstPerson") {
        cameraPosition.set(
          horse.position.x + forwardX * firstPersonForwardOffset,
          horse.position.y + firstPersonHeight,
          horse.position.z + forwardZ * firstPersonForwardOffset,
        );
        lookTarget.set(
          horse.position.x + forwardX * firstPersonLookDistance,
          horse.position.y + firstPersonHeight - 0.15,
          horse.position.z + forwardZ * firstPersonLookDistance,
        );
        camera.fov += (firstPersonFov - camera.fov) * smoothing;
      } else {
        cameraPosition.set(
          horse.position.x - forwardX * riderBackOffset,
          horse.position.y + riderEyeHeight,
          horse.position.z - forwardZ * riderBackOffset,
        );
        lookTarget.set(
          horse.position.x + forwardX * riderLookDistance,
          horse.position.y + 1.4,
          horse.position.z + forwardZ * riderLookDistance,
        );
        camera.fov += (54 - camera.fov) * smoothing;
      }
    } else {
      cameraPosition.copy(overviewPosition);
      lookTarget.copy(overviewTarget);
      camera.fov += (42 - camera.fov) * smoothing;
    }

    camera.position.lerp(cameraPosition, smoothing);
    camera.updateProjectionMatrix();
    camera.lookAt(lookTarget);
  });

  return null;
}
