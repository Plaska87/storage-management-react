import React from "react";
import { Package } from "lucide-react";
import { useStorage } from "../context/StorageContext";
import "./Pallet.css";

function Pallet({ palletKey, row, col, palletIdx }) {
  const { state, actions } = useStorage();
  const material = state.storageData[palletKey] || "";
  const isEmpty = !material || material.trim() === "";

  const handleClick = () => {
    actions.setEditingPallet(palletKey);
  };

  const palletClasses = ["pallet", isEmpty ? "empty" : "occupied"]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={palletClasses}
      onClick={handleClick}
      data-pallet-key={palletKey}
      title={isEmpty ? "Click to add material" : `${material} - Click to edit`}
    >
      <div className="pallet-header">
        <div className="pallet-label">P{palletIdx + 1}</div>
        {!isEmpty && <Package size={10} className="pallet-icon" />}
      </div>

      <div className="pallet-content">
        {isEmpty ? (
          <span className="empty-text">Empty</span>
        ) : (
          <span className="material-text">{material}</span>
        )}
      </div>
    </div>
  );
}

export default Pallet;
