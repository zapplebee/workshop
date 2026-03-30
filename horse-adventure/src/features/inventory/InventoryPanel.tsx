import type { InventoryDisplayEntry } from "./types";

export function InventoryPanel({
  isOpen,
  supplies,
  keyItems,
  debugFlags,
  onToggle,
}: {
  isOpen: boolean;
  supplies: InventoryDisplayEntry[];
  keyItems: InventoryDisplayEntry[];
  debugFlags: string[];
  onToggle: () => void;
}) {
  return (
    <div className="inventory-shell">
      <button className={`inventory-toggle${isOpen ? " is-active" : ""}`} type="button" onClick={onToggle}>
        Inventory
      </button>

      {isOpen ? (
        <div className="inventory-panel">
          <div className="inventory-title-row">
            <div>
              <div className="inventory-title">Saddlebags</div>
              <p className="inventory-help">Press `I` or use the button to check what you are carrying.</p>
            </div>
            <button className="inventory-close" type="button" onClick={onToggle}>
              Close
            </button>
          </div>

          <div className="inventory-section">
            <div className="inventory-section-title">Supplies</div>
            {supplies.length ? (
              <div className="inventory-list">
                {supplies.map((item) => (
                  <div key={item.id} className="inventory-row">
                    <div>
                      <div className="inventory-item-name">{item.name}</div>
                      {item.description ? <div className="inventory-item-description">{item.description}</div> : null}
                    </div>
                    <div className="inventory-count">x{item.quantity}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="inventory-empty">No supplies yet.</div>
            )}
          </div>

          <div className="inventory-section">
            <div className="inventory-section-title">Key Items</div>
            {keyItems.length ? (
              <div className="inventory-list">
                {keyItems.map((item) => (
                  <div key={item.id} className="inventory-row">
                    <div>
                      <div className="inventory-item-name">{item.name}</div>
                      {item.description ? <div className="inventory-item-description">{item.description}</div> : null}
                    </div>
                    <div className="inventory-count">Held</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="inventory-empty">No key items yet.</div>
            )}
          </div>

          <div className="inventory-section inventory-section-debug">
            <div className="inventory-section-title">Debug Flags</div>
            {debugFlags.length ? (
              <div className="inventory-list">
                {debugFlags.map((flag) => (
                  <div key={flag} className="inventory-row inventory-row-debug">
                    <div className="inventory-item-name">{flag}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="inventory-empty">No world flags set.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
