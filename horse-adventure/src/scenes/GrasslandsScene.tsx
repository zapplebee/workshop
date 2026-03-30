import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import type { ConversationOption } from "../features/conversations/types";
import { InventoryPanel } from "../features/inventory/InventoryPanel";
import type { InventoryDisplayEntry } from "../features/inventory/types";

function dispatchKey(code: string, type: "keydown" | "keyup") {
  window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
}

function MobileActionButton({
  label,
  code,
  hold = true,
}: {
  label: string;
  code: string;
  hold?: boolean;
}) {
  const press = () => {
    dispatchKey(code, "keydown");
  };

  const release = () => {
    if (hold) {
      dispatchKey(code, "keyup");
    }
  };

  return (
    <button
      className="mobile-control-button"
      type="button"
      onPointerDown={(event) => {
        event.preventDefault();
        press();
      }}
      onPointerUp={(event) => {
        event.preventDefault();
        release();
      }}
      onPointerCancel={release}
      onPointerLeave={release}
    >
      {label}
    </button>
  );
}

function MobileControls({ onInteract, disabled = false }: { onInteract: () => void; disabled?: boolean }) {
  if (disabled) {
    return null;
  }

  return (
    <div className="mobile-controls" aria-label="Mobile controls">
      <div className="mobile-controls-pad">
        <div className="mobile-controls-row mobile-controls-row-top">
          <MobileActionButton label="Forward" code="KeyW" />
        </div>
        <div className="mobile-controls-row">
          <MobileActionButton label="Left" code="KeyA" />
          <MobileActionButton label="Back" code="KeyS" />
          <MobileActionButton label="Right" code="KeyD" />
        </div>
      </div>

      <div className="mobile-controls-actions">
        <button className="mobile-control-button" type="button" onClick={onInteract}>
          Interact
        </button>
        <MobileActionButton label="Camera" code="KeyC" hold={false} />
      </div>
    </div>
  );
}

type GrasslandsSceneProps = {
  sceneContent: ReactNode;
  activeNode: { text: string; options?: ConversationOption[] } | null;
  activeConversationName?: string;
  onConversationOption: (option: ConversationOption) => void;
  onCloseConversation: () => void;
  onGoToCleanroom: () => void;
  inventoryOpen: boolean;
  inventorySupplies: InventoryDisplayEntry[];
  inventoryKeyItems: InventoryDisplayEntry[];
  debugFlags: string[];
  onToggleInventory: () => void;
  onMobileInteract: () => void;
};

export function GrasslandsScene({
  sceneContent,
  activeNode,
  activeConversationName,
  onConversationOption,
  onCloseConversation,
  onGoToCleanroom,
  inventoryOpen,
  inventorySupplies,
  inventoryKeyItems,
  debugFlags,
  onToggleInventory,
  onMobileInteract,
}: GrasslandsSceneProps) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  useEffect(() => {
    setSelectedOptionIndex(0);
  }, [activeNode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeNode) {
        const optionCount = activeNode.options?.length ?? 0;

        if (event.code === "ArrowLeft" || event.code === "ArrowUp") {
          event.preventDefault();
          if (optionCount > 0) {
            setSelectedOptionIndex((current) => (current - 1 + optionCount) % optionCount);
          }
          return;
        }

        if (event.code === "ArrowRight" || event.code === "ArrowDown") {
          event.preventDefault();
          if (optionCount > 0) {
            setSelectedOptionIndex((current) => (current + 1) % optionCount);
          }
          return;
        }

        if (event.code === "Enter" || event.code === "Space") {
          event.preventDefault();
          if (optionCount > 0) {
            const option = activeNode.options?.[selectedOptionIndex];
            if (option) {
              onConversationOption(option);
            }
          } else {
            onCloseConversation();
          }
          return;
        }
      }

      if (event.code !== "KeyI" || event.repeat) {
        return;
      }

      event.preventDefault();
      onToggleInventory();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeNode, onCloseConversation, onConversationOption, onToggleInventory, selectedOptionIndex]);

  return (
    <div className="scene-shell">
      <Canvas shadows className="scene-canvas" dpr={[1, 1.5]} camera={{ position: [0, 14, 42], fov: 42, near: 0.1, far: 700 }}>
        <Suspense fallback={null}>{sceneContent}</Suspense>
      </Canvas>

      <div className="scene-sidebar">
        <div className="scene-nav scene-nav-sidebar">
          <button className="scene-nav-button is-active" type="button">
            Grasslands
          </button>
          <button className="scene-nav-button" type="button" onClick={onGoToCleanroom}>
            Cleanroom
          </button>
        </div>

        <InventoryPanel isOpen={inventoryOpen} supplies={inventorySupplies} keyItems={inventoryKeyItems} debugFlags={debugFlags} onToggle={onToggleInventory} />
      </div>

      <MobileControls onInteract={onMobileInteract} disabled={activeNode !== null} />

      {activeNode ? (
        <div className="dialog-shell">
          <div className="dialog-card">
            <div className="dialog-name">{activeConversationName ?? "Conversation"}</div>
            <p className="dialog-text">{activeNode.text}</p>
            <div className="dialog-options">
              {activeNode.options?.map((option, index) => (
                <button
                  key={index}
                  className={`dialog-option${selectedOptionIndex === index ? " is-active" : ""}`}
                  type="button"
                  onClick={() => onConversationOption(option)}
                  onMouseEnter={() => setSelectedOptionIndex(index)}
                >
                  {option.label}
                </button>
              ))}
              {!activeNode.options?.length ? (
                <button className="dialog-option is-active" type="button" onClick={onCloseConversation}>
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
