import { useLocation } from "react-router-dom";

export type SceneMode = "grasslands" | "workshop";

export function useSceneRouting() {
  const location = useLocation();
  const sceneMode: SceneMode = location.pathname.startsWith("/cleanroom") ? "workshop" : "grasslands";

  return sceneMode;
}
