import React from "react";
import { STORAGE_CONFIG, useStorage } from "../context/StorageContext";
import Pallet from "./Pallet";
import "./StorageCell.css";

function StorageCell({ row, col }) {
  const { actions } = useStorage();

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

  return (
    <div className="storage-cell-content" data-row={row} data-col={col}>
      {renderPallets()}
    </div>
  );
}

export default StorageCell;
