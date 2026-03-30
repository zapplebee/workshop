import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

type CleanroomSceneProps<Action extends string> = {
  sceneContent: ReactNode;
  gizmoContent: ReactNode;
  browser: Array<{ category: string; entries: Array<{ id: string; name: string }> }>;
  selectedElementId: string;
  onElementSelect: (elementId: string) => void;
  title: string;
  help: string;
  actions: Action[];
  activeAction: Action;
  onActionChange: (action: Action) => void;
  wireframe: boolean;
  onWireframeChange: (checked: boolean) => void;
  wireframeLabel: string;
};

export function CleanroomScene<Action extends string>({
  sceneContent,
  gizmoContent,
  browser,
  selectedElementId,
  onElementSelect,
  title,
  help,
  actions,
  activeAction,
  onActionChange,
  wireframe,
  onWireframeChange,
  wireframeLabel,
}: CleanroomSceneProps<Action>) {
  return (
    <div className="scene-shell">
      <Canvas shadows className="scene-canvas" dpr={[1, 1.5]} camera={{ position: [0, 6, 14], fov: 46, near: 0.1, far: 200 }}>
        <Suspense fallback={null}>{sceneContent}</Suspense>
      </Canvas>

      <div className="workshop-hud">
        <div className="workshop-title">{title}</div>
        <p className="workshop-help">{help}</p>
        <div className="workshop-browser">
          {browser.map((group) => (
            <div key={group.category} className="workshop-browser-group">
              <div className="workshop-browser-title">{group.category}</div>
              <div className="workshop-browser-items">
                {group.entries.map((entry) => (
                  <button
                    key={entry.id}
                    className={`workshop-browser-item${selectedElementId === entry.id ? " is-active" : ""}`}
                    type="button"
                    onClick={() => onElementSelect(entry.id)}
                  >
                    {entry.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {actions.length ? (
          <div className="workshop-controls">
            {actions.map((action) => (
              <button
                key={action}
                className={`workshop-control${activeAction === action ? " is-active" : ""}`}
                type="button"
                onClick={() => onActionChange(action)}
              >
                {action}
              </button>
            ))}
          </div>
        ) : null}
        {wireframeLabel ? (
          <label className="workshop-toggle">
            <input checked={wireframe} type="checkbox" onChange={(event) => onWireframeChange(event.target.checked)} />
            <span>{wireframeLabel}</span>
          </label>
        ) : null}
      </div>

      <div className="workshop-gizmo">
        <Canvas className="workshop-gizmo-canvas" camera={{ position: [0, 0, 4], fov: 32, near: 0.1, far: 20 }}>
          {gizmoContent}
        </Canvas>
      </div>
    </div>
  );
}
