import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { Package } from "lucide-react";
import { useStorage } from "../context/StorageContext";
import "./Pallet.css";

function Pallet({ palletKey, row, col, palletIdx }) {
  const { state, actions } = useStorage();
  const material = state.storageData[palletKey] || "";
  const isEmpty = !material || material.trim() === "";

  // Drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: "pallet",
    item: { palletKey, material, row, col, palletIdx },
    canDrag: !isEmpty,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    begin: (monitor) => {
      console.log("Drag started for pallet:", palletKey);
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      console.log("Drag ended:", { item, dropResult });
      if (dropResult && dropResult.cellType === "pallet") {
        // Dropped on another pallet
        actions.movePallet(item.palletKey, dropResult.palletKey);
      }
    },
  });

  // Drop functionality (for pallet-to-pallet drops)
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "pallet",
    drop: () => ({ palletKey, cellType: "pallet" }),
    canDrop: (item) => item.palletKey !== palletKey,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Combine drag and drop refs
  const ref = (node) => {
    drag(node);
    drop(node);
  };

  const handleClick = () => {
    actions.setEditingPallet(palletKey);
  };

  const palletClasses = [
    "pallet",
    isEmpty ? "empty" : "occupied",
    isDragging && "dragging",
    isOver && canDrop && "drop-target",
    isOver && !canDrop && "drop-invalid",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
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

      {isDragging && <div className="drag-overlay" />}
    </div>
  );
}

export default Pallet;
