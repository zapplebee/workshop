import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./index.css";
import { CleanroomScene } from "./scenes/CleanroomScene";
import { GrasslandsScene } from "./scenes/GrasslandsScene";
import { UploadScene } from "./scenes/UploadScene";
import { WorkshopGizmoScene } from "./features/cleanroom/WorkshopGizmoScene";
import { WorkshopScene } from "./features/cleanroom/WorkshopScene";
import { useCleanroomState } from "./features/cleanroom/useCleanroomState";
import { useConversations } from "./features/conversations/useConversations";
import { useInventory } from "./features/inventory/useInventory";
import type { InventoryItemId } from "./features/inventory/types";
import type { ConversationActor } from "./features/conversations/types";
import type { ConversationOption } from "./features/conversations/types";
import { GrasslandsWorld } from "./features/grasslands/GrasslandsWorld";
import { useSceneRouting } from "./features/navigation/useSceneRouting";
import { useWorldFlags } from "./features/world-flags/useWorldFlags";

function AppRoutes() {
  const [workshopCameraQuaternion, setWorkshopCameraQuaternion] = useState<[number, number, number, number]>([0, 0, 0, 1]);
  const [mobileInteractSignal, setMobileInteractSignal] = useState(0);
  const sceneMode = useSceneRouting();
  const location = useLocation();
  const navigate = useNavigate();
  const inventory = useInventory();
  const worldFlags = useWorldFlags();
  const {
    activeConversationActor,
    activeConversation,
    activeNode,
    startConversation,
    closeConversation,
    chooseOption,
    setCurrentNodeId,
  } = useConversations();

  useEffect(() => {
    setCurrentNodeId(null);
  }, [sceneMode, setCurrentNodeId]);

  const hasRequiredItems = (option: ConversationOption) => {
    return option.requiresItems?.every((requirement) => inventory.getQuantity(requirement.itemId) >= requirement.amount) ?? true;
  };

  const hasRequiredFlags = (option: ConversationOption) => {
    return option.requiresFlags?.every((flagId) => worldFlags.hasFlag(flagId)) ?? true;
  };

  const formatInventoryPhrase = (itemId: InventoryItemId, amount: number) => {
    const name = itemId === "carrot" ? "carrot" : itemId;
    return `${amount} ${name}${amount === 1 ? "" : "s"}`;
  };

  const formatConversationOptionLabel = (option: ConversationOption) => {
    if (!option.removeItems?.length) {
      return option.label;
    }

    const costLabel = option.removeItems.map((cost) => formatInventoryPhrase(cost.itemId, cost.amount)).join(", ");
    return `${option.label} (${costLabel})`;
  };

  const handleConversationStart = (actor: ConversationActor) => {
    if (sceneMode !== "grasslands") {
      return;
    }

    startConversation(actor);
  };

  const handleConversationOption = (option: ConversationOption) => {
    if (!hasRequiredItems(option) || !hasRequiredFlags(option)) {
      return;
    }

    const canPayCosts = option.removeItems?.every((cost) => inventory.getQuantity(cost.itemId) >= cost.amount) ?? true;

    if (!canPayCosts) {
      return;
    }

    for (const cost of option.removeItems ?? []) {
      inventory.removeItem(cost.itemId, cost.amount);
    }

    for (const flagId of option.setFlags ?? []) {
      worldFlags.setFlag(flagId);
    }

    chooseOption(option);
  };

  const activeSceneNode = activeNode ? {
    ...activeNode,
    options: activeNode.options?.filter((option) => hasRequiredItems(option) && hasRequiredFlags(option)).map((option) => ({
      ...option,
      label: formatConversationOptionLabel(option),
    })),
  } : null;

  const grasslandsContent = (
    <GrasslandsWorld
      conversationActive={activeNode !== null}
      conversationActor={activeConversationActor}
      conversationNodeAnimation={activeNode?.animation}
      controlsLocked={activeNode !== null}
      interactSignal={mobileInteractSignal}
      onCollectItem={(itemId: InventoryItemId) => inventory.addItem(itemId, 1).added}
      onConversationStart={handleConversationStart}
    />
  );

  const selectedElementId = location.pathname.startsWith("/cleanroom/") ? location.pathname.replace("/cleanroom/", "") : "mouse";
  const {
    selectedEntry,
    selectedControls,
    selectedAction,
    selectedWireframe,
    cleanroomBrowser,
    setSelectedAction,
    setSelectedWireframe,
  } = useCleanroomState(selectedElementId);

  const cleanroomContent = (
    <WorkshopScene
      content={selectedEntry.render({ action: selectedAction, wireframe: selectedWireframe })}
      onCameraQuaternionChange={setWorkshopCameraQuaternion}
      showReferenceRabbit={selectedEntry.id !== "rabbit"}
    />
  );

  return (
    <Routes>
      <Route
        path="grasslands"
        element={
          <GrasslandsScene
            sceneContent={grasslandsContent}
            activeNode={activeSceneNode}
            activeConversationName={activeConversation?.name}
            onGoToCleanroom={() => navigate(`/cleanroom/${selectedEntry.id}`)}
            onGoToUpload={() => navigate("/upload")}
            inventoryOpen={inventory.isOpen}
            inventorySupplies={inventory.stackableEntries}
            inventoryKeyItems={inventory.keyEntries}
            debugFlags={worldFlags.flags}
            onConversationOption={handleConversationOption}
            onCloseConversation={closeConversation}
            onMobileInteract={() => setMobileInteractSignal((current) => current + 1)}
            onToggleInventory={inventory.toggle}
          />
        }
      />
      <Route
        path="cleanroom/:elementId"
        element={
          <CleanroomScene
            sceneContent={cleanroomContent}
            gizmoContent={<WorkshopGizmoScene quaternion={workshopCameraQuaternion} />}
            browser={cleanroomBrowser}
            selectedElementId={selectedEntry.id}
            onElementSelect={(nextElementId) => navigate(`/cleanroom/${nextElementId}`)}
            title={selectedControls?.title ?? `${selectedEntry.name} Preview`}
            help={selectedControls?.help ?? "Drag to orbit, scroll to zoom, right-drag to pan, arrow keys to switch scenes."}
            actions={selectedControls ? [...selectedControls.actions] : []}
            activeAction={selectedAction}
            onActionChange={setSelectedAction}
            wireframe={selectedWireframe}
            onWireframeChange={setSelectedWireframe}
            wireframeLabel={selectedControls?.wireframeLabel ?? ""}
            onGoToGrasslands={() => navigate("/grasslands")}
            onGoToUpload={() => navigate("/upload")}
          />
        }
      />
      <Route
        path="upload"
        element={<UploadScene onGoToGrasslands={() => navigate("/grasslands")} onGoToCleanroom={() => navigate(`/cleanroom/${selectedEntry.id}`)} />}
      />
      <Route path="cleanroom" element={<Navigate to="/cleanroom/mouse" replace />} />
      <Route path="*" element={<Navigate to="/grasslands" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
