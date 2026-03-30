import { useEffect, useRef } from "react";
import type { MovementKeys } from "./types";

export function useMovementKeys() {
  const keysRef = useRef<MovementKeys>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const setKey = (code: string, pressed: boolean) => {
      if (code === "KeyW") {
        keysRef.current.forward = pressed;
      }
      if (code === "KeyS") {
        keysRef.current.backward = pressed;
      }
      if (code === "KeyA") {
        keysRef.current.left = pressed;
      }
      if (code === "KeyD") {
        keysRef.current.right = pressed;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      setKey(event.code, true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKey(event.code, false);
    };

    const clearKeys = () => {
      keysRef.current.forward = false;
      keysRef.current.backward = false;
      keysRef.current.left = false;
      keysRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, []);

  return keysRef;
}
