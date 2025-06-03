import React from "react";
import { useDrop } from "react-dnd";
import { STORAGE_CONFIG, useStorage } from "../context/StorageContext";
import Pallet from "./Pallet";
import "./StorageCell.css";

function StorageCell({ row, col }) {
  const { actions } = useStorage();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "pallet",
    drop: (item, monitor) => {
      // Only handle drops that aren't handled by pallets
      if (!monitor.didDrop()) {
        // Find the first empty pallet in this cell
        for (
          let palletIdx = 0;
          palletIdx < STORAGE_CONFIG.PALLETS_PER_CELL;
          palletIdx++
        ) {
          const targetKey = `${row}_${col}_${palletIdx}`;
          // Move to first empty pallet in this cell
          actions.movePallet(item.palletKey, targetKey);
          break;
        }
      }
      return { row, col, cellType: "storage" };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Generate pallets for this cell
  const renderPallets = () => {
    const pallets = [];

    for (
      let palletIdx = 0;
      palletIdx < STORAGE_CONFIG.PALLETS_PER_CELL;
      palletIdx++
    ) {
      const palletKey = `${row}_${col}_${palletIdx}`;
      pallets.push(
        <Pallet
          key={palletKey}
          palletKey={palletKey}
          row={row}
          col={col}
          palletIdx={palletIdx}
        />
      );
    }

    return pallets;
  };

  const cellClasses = [
    "storage-cell-content",
    isOver && canDrop && "drop-target-active",
    isOver && !canDrop && "drop-target-invalid",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={drop} className={cellClasses} data-row={row} data-col={col}>
      {renderPallets()}
    </div>
  );
}

export default StorageCell;
