import { useMemo, useState } from "react";
import { elementManifest, elementManifestById } from "../../elements/manifest";

export function useCleanroomState(selectedElementId: string) {
  const [cleanroomActions, setCleanroomActions] = useState<Record<string, string>>({});
  const [cleanroomWireframes, setCleanroomWireframes] = useState<Record<string, boolean>>({});

  const selectedEntry = elementManifestById[selectedElementId] ?? elementManifestById.mouse!;
  const selectedControls = selectedEntry.controls;
  const selectedAction = selectedControls ? cleanroomActions[selectedEntry.id] ?? selectedControls.defaultAction : "none";
  const selectedWireframe = selectedControls?.wireframeLabel ? (cleanroomWireframes[selectedEntry.id] ?? true) : false;
  const cleanroomBrowser = useMemo(
    () => ["creatures", "fixtures", "items"].map((category) => ({
      category,
      entries: elementManifest.filter((entry) => entry.category === category).map((entry) => ({ id: entry.id, name: entry.name })),
    })).filter((group) => group.entries.length > 0),
    [],
  );

  return {
    selectedEntry,
    selectedControls,
    selectedAction,
    selectedWireframe,
    cleanroomBrowser,
    setSelectedAction: (action: string) => {
      setCleanroomActions((current) => ({ ...current, [selectedEntry.id]: action }));
    },
    setSelectedWireframe: (checked: boolean) => {
      setCleanroomWireframes((current) => ({ ...current, [selectedEntry.id]: checked }));
    },
  };
}
