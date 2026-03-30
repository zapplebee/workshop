import { useEffect, useState } from "react";
import type { CameraMode } from "./types";

export function useCameraMode() {
  const [mode, setMode] = useState<CameraMode>("overview");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyC" || event.repeat) {
        return;
      }

      setMode((currentMode) => {
        if (currentMode === "overview") {
          return "follow";
        }
        if (currentMode === "follow") {
          return "firstPerson";
        }
        return "overview";
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return mode;
}
