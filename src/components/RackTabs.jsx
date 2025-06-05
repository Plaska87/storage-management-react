import React from "react";
import { STORAGE_CONFIG, useStorage, getStats } from "../context/StorageContext";
import "./RackTabs.css";

function RackTabs() {
  const { state, actions } = useStorage();

  // Calculate stats for each rack
  const getRackStats = (rackId) => {
    // Filter storage data for this rack
    const rackData = {};
    Object.keys(state.storageData).forEach((key) => {
      if (key.startsWith(`${rackId}_`)) {
        rackData[key] = state.storageData[key];
      }
    });

    const totalPallets =
      STORAGE_CONFIG.ROWS *
        STORAGE_CONFIG.COLUMNS *
        STORAGE_CONFIG.PALLETS_PER_CELL -
      3 * STORAGE_CONFIG.PALLETS_PER_CELL; // Subtract forklift pathway

    const occupiedCount = Object.values(rackData).filter(
      (material) => material && material.trim()
    ).length;
    const utilization =
      totalPallets > 0 ? Math.round((occupiedCount / totalPallets) * 100) : 0;

    return { utilization, occupiedCount, totalPallets };
  };

  // Get utilization color
  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return "#f44336"; // Red
    if (utilization >= 60) return "#ff9800"; // Orange
    if (utilization >= 40) return "#ffeb3b"; // Yellow
    return "#4caf50"; // Green
  };

  const handleTabClick = (rackId) => {
    actions.setCurrentRack(rackId);
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case "1":
            event.preventDefault();
            actions.setCurrentRack("A");
            break;
          case "2":
            event.preventDefault();
            actions.setCurrentRack("B");
            break;
          case "3":
            event.preventDefault();
            actions.setCurrentRack("C");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [actions]);

  return (
    <div className="rack-tabs-container">
      <div className="rack-tabs">
        {STORAGE_CONFIG.RACKS.map((rack, index) => {
          const stats = getRackStats(rack.id);
          const isActive = state.currentRack === rack.id;
          const utilizationColor = getUtilizationColor(stats.utilization);

          return (
            <button
              key={rack.id}
              className={`rack-tab ${isActive ? "active" : ""}`}
              onClick={() => handleTabClick(rack.id)}
              style={{
                borderBottomColor: isActive ? rack.color : "transparent",
              }}
            >
              <div className="rack-tab-content">
                <div className="rack-tab-header">
                  <span className="rack-name">{rack.name}</span>
                  <span className="rack-shortcut">Ctrl+{index + 1}</span>
                </div>
                <div className="rack-tab-stats">
                  <div
                    className="utilization-bar"
                    style={{ backgroundColor: utilizationColor }}
                  >
                    <span className="utilization-text">{stats.utilization}%</span>
                  </div>
                  <div className="pallet-count">
                    {stats.occupiedCount}/{stats.totalPallets}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="rack-info">
        <span className="current-rack-label">
          Aktualny regał: <strong>{STORAGE_CONFIG.RACKS.find(r => r.id === state.currentRack)?.name}</strong>
        </span>
      </div>
    </div>
  );
}

export default RackTabs;
