import React from "react";
import { Package, PackageCheck, PackageX, TrendingUp } from "lucide-react";
import { useStorage } from "../context/StorageContext";
import { getStats } from "../context/StorageContext";
import "./StatsPanel.css";

function StatsPanel() {
  const { state } = useStorage();
  const stats = getStats(state.storageData);

  const statItems = [
    {
      icon: Package,
      label: "Łączna liczba palet",
      value: stats.totalPallets,
      color: "#64b5f6",
    },
    {
      icon: PackageCheck,
      label: "Zajęte",
      value: stats.occupiedCount,
      color: "#39c96e",
    },
    {
      icon: PackageX,
      label: "Puste",
      value: stats.emptyCount,
      color: "#b0bec5",
    },
    {
      icon: TrendingUp,
      label: "Wykorzystanie",
      value: `${stats.utilization}%`,
      color:
        stats.utilization > 80
          ? "#e74c3c"
          : stats.utilization > 60
          ? "#f39c12"
          : "#39c96e",
    },
  ];

  return (
    <div className="stats-panel card">
      <div className="stats-grid">
        {statItems.map((item, index) => (
          <div key={index} className="stat-item">
            <div className="stat-icon" style={{ color: item.color }}>
              <item.icon size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{item.label}</div>
              <div className="stat-value" style={{ color: item.color }}>
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="utilization-bar">
        <div className="utilization-bar-label">Wykorzystanie magazynu</div>
        <div className="utilization-bar-container">
          <div
            className="utilization-bar-fill"
            style={{
              width: `${stats.utilization}%`,
              backgroundColor: statItems[3].color,
            }}
          />
          <div className="utilization-bar-text">{stats.utilization}%</div>
        </div>
      </div>
    </div>
  );
}

export default StatsPanel;
