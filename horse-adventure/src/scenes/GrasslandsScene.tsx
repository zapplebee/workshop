import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

type ConversationOption = {
  label: string;
  next?: string;
  end?: string;
};

type GrasslandsSceneProps = {
  sceneContent: ReactNode;
  activeNode: { text: string; options?: ConversationOption[] } | null;
  activeConversationName?: string;
  onConversationOption: (option: ConversationOption) => void;
  onCloseConversation: () => void;
};

export function GrasslandsScene({
  sceneContent,
  activeNode,
  activeConversationName,
  onConversationOption,
  onCloseConversation,
}: GrasslandsSceneProps) {
  return (
    <div className="scene-shell">
      <Canvas shadows className="scene-canvas" dpr={[1, 1.5]} camera={{ position: [0, 14, 42], fov: 42, near: 0.1, far: 700 }}>
        <Suspense fallback={null}>{sceneContent}</Suspense>
      </Canvas>

      {activeNode ? (
        <div className="dialog-shell">
          <div className="dialog-card">
            <div className="dialog-name">{activeConversationName ?? "Conversation"}</div>
            <p className="dialog-text">{activeNode.text}</p>
            <div className="dialog-options">
              {activeNode.options?.map((option, index) => (
                <button key={index} className="dialog-option" type="button" onClick={() => onConversationOption(option)}>
                  {option.label}
                </button>
              ))}
              {!activeNode.options?.length ? (
                <button className="dialog-option" type="button" onClick={onCloseConversation}>
                  Continue
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
