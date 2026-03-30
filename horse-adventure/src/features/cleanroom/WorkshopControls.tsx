import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function WorkshopControls({ onCameraQuaternionChange }: { onCameraQuaternionChange?: (quaternion: [number, number, number, number]) => void }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<ThreeOrbitControls | null>(null);
  const lastQuaternionRef = useRef("");

  useEffect(() => {
    camera.position.set(0, 2.8, 8);
    const controls = new ThreeOrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.6, 0);
    controls.enablePan = true;
    controls.minDistance = 2;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.update();
    controlsRef.current = controls;

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl]);

  useFrame(() => {
    controlsRef.current?.update();

    if (!onCameraQuaternionChange) {
      return;
    }

    const next: [number, number, number, number] = [camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w];
    const key = next.join(":");

    if (key !== lastQuaternionRef.current) {
      lastQuaternionRef.current = key;
      onCameraQuaternionChange(next);
    }
  });

  return null;
}
