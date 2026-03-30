import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type SceneMode = "grasslands" | "workshop";

export function useSceneRouting() {
  const location = useLocation();
  const navigate = useNavigate();
  const paths = useMemo(() => ["/grasslands", "/cleanroom/mouse"], []);
  const sceneMode: SceneMode = location.pathname.startsWith("/cleanroom") ? "workshop" : "grasslands";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "ArrowLeft" && event.code !== "ArrowRight") {
        return;
      }

      event.preventDefault();
      const currentIndex = paths.indexOf(location.pathname);
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      const direction = event.code === "ArrowRight" ? 1 : -1;
      const nextIndex = (safeIndex + direction + paths.length) % paths.length;
      const nextPath = paths.at(nextIndex) ?? "/grasslands";
      navigate(nextPath);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [location.pathname, navigate, paths]);

  return sceneMode;
}
