import React from "react";
import {
  X,
  Package,
  PackageCheck,
  PackageX,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useStorage } from "../context/StorageContext";
import { getStats } from "../context/StorageContext";
import "./StatsModal.css";

function StatsModal() {
  const { state, actions } = useStorage();
  const stats = getStats(state.storageData);

  const isOpen = state.showStatsModal;

  const statItems = [
    {
      icon: Package,
      label: "Łączna liczba palet",
      value: stats.totalPallets,
      color: "#dc3545",
    },
    {
      icon: PackageCheck,
      label: "Zajęte",
      value: stats.occupiedCount,
      color: "#28a745",
    },
    {
      icon: PackageX,
      label: "Puste",
      value: stats.emptyCount,
      color: "#6c757d",
    },
    {
      icon: TrendingUp,
      label: "Wykorzystanie",
      value: `${stats.utilization}%`,
      color:
        stats.utilization > 80
          ? "#dc3545"
          : stats.utilization > 60
          ? "#ff8c00"
          : "#28a745",
    },
  ];

  const handleClose = () => {
    actions.setShowStatsModal(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  // Add event listener for escape key
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyPress);
      return () => {
        document.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content stats-modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <BarChart3 size={20} />
            <h2>Statystyki magazynu</h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            title="Zamknij"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="stats-grid">
            {statItems.map((item, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon" style={{ color: item.color }}>
                  <item.icon size={24} />
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

          <div className="utilization-section">
            <div className="utilization-bar">
              <div className="utilization-bar-label">
                Wykorzystanie magazynu
              </div>
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
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={handleClose}
            title="Zamknij"
          >
            <X size={16} />
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatsModal;
