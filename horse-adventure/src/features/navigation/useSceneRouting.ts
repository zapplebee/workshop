import { useLocation } from "react-router-dom";

export type SceneMode = "grasslands" | "workshop" | "upload";

export function useSceneRouting() {
  const location = useLocation();
  const sceneMode: SceneMode = location.pathname.startsWith("/cleanroom")
    ? "workshop"
    : location.pathname.startsWith("/upload")
      ? "upload"
      : "grasslands";

  return sceneMode;
}
