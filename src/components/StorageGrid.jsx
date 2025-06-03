import React from "react";
import { STORAGE_CONFIG } from "../context/StorageContext";
import StorageCell from "./StorageCell";
import "./StorageGrid.css";

function StorageGrid() {
  // Generate column headers (A-M)
  const columnHeaders = Array.from({ length: STORAGE_CONFIG.COLUMNS }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  // Generate grid cells
  const renderGrid = () => {
    const cells = [];
    let pathwayAdded = false;

    for (let row = 0; row < STORAGE_CONFIG.ROWS; row++) {
      // Add row header
      cells.push(
        <div key={`row-header-${row}`} className="row-header">
          Row {row + 1}
        </div>
      );

      // Add cells for this row
      for (let col = 0; col < STORAGE_CONFIG.COLUMNS; col++) {
        // Check if this is forklift pathway
        if (
          col === STORAGE_CONFIG.FORKLIFT_PATHWAY.col &&
          row >= STORAGE_CONFIG.FORKLIFT_PATHWAY.startRow
        ) {
          // Only add the pathway block once (on the first pathway row)
          if (!pathwayAdded) {
            const pathwayRows =
              STORAGE_CONFIG.ROWS - STORAGE_CONFIG.FORKLIFT_PATHWAY.startRow;
            cells.push(
              <div
                key={`pathway-merged`}
                className="storage-cell pathway pathway-merged"
                style={{
                  gridRow: `span ${pathwayRows}`,
                }}
              >
                <div className="pathway-content">
                  🚛
                  <br />
                  FORKLIFT
                  <br />
                  PATHWAY
                </div>
              </div>
            );
            pathwayAdded = true;
          }
          // Skip adding individual pathway cells for subsequent rows
        } else {
          cells.push(
            <StorageCell key={`cell-${row}-${col}`} row={row} col={col} />
          );
        }
      }
    }

    return cells;
  };

  return (
    <div className="grid-container card">
      {/* Column headers */}
      <div className="grid-header">
        <div className="corner-header"></div>
        {columnHeaders.map((letter) => (
          <div key={letter} className="col-header">
            {letter}
          </div>
        ))}
      </div>

      {/* Storage grid */}
      <div className="storage-grid">{renderGrid()}</div>
    </div>
  );
}

export default StorageGrid;
