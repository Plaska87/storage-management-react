import React, { useState, useEffect } from "react";
import { X, Save, Trash2, Package, Scan } from "lucide-react";
import { useStorage } from "../context/StorageContext";
import BarcodeScanner from "./BarcodeScanner";
import "./EditModal.css";

function EditModal() {
  const { state, actions } = useStorage();
  const [materialInput, setMaterialInput] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const isOpen = state.editingPallet !== null;
  const currentMaterial = state.editingPallet
    ? state.storageData[state.editingPallet] || ""
    : "";

  // Update input when editing pallet changes
  useEffect(() => {
    if (state.editingPallet) {
      setMaterialInput(currentMaterial);
    }
  }, [state.editingPallet, currentMaterial]);

  // Parse pallet information
  const getPalletInfo = () => {
    if (!state.editingPallet) return "";

    const [row, col, palletIdx] = state.editingPallet.split("_").map(Number);
    const columnLetter = String.fromCharCode(65 + col);

    return `Row ${row + 1}, Column ${columnLetter}, Pallet ${palletIdx + 1}`;
  };

  const handleSave = () => {
    if (state.editingPallet) {
      const trimmedMaterial = materialInput.trim();
      actions.updatePallet(state.editingPallet, trimmedMaterial);
      actions.showToast("Changes saved successfully!", "success");
      handleClose();
    }
  };

  const handleClear = () => {
    if (state.editingPallet) {
      actions.clearPallet(state.editingPallet);
      actions.showToast("Pallet cleared!", "warning");
      handleClose();
    }
  };

  const handleClose = () => {
    actions.setEditingPallet(null);
    setMaterialInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleBarcodeScanned = (scannedCode) => {
    setMaterialInput(scannedCode);
    setShowBarcodeScanner(false);
    actions.showToast("Barcode scanned successfully!", "success");
  };

  const handleOpenBarcodeScanner = () => {
    setShowBarcodeScanner(true);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <Package size={20} />
            <h2>Edit Pallet Content</h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="pallet-info">
            <strong>Location:</strong> {getPalletInfo()}
          </div>

          <div className="current-content">
            <strong>Current Content:</strong>{" "}
            <span className={currentMaterial ? "has-content" : "empty-content"}>
              {currentMaterial || "Empty"}
            </span>
          </div>

          <div className="input-group">
            <label htmlFor="materialInput">Material:</label>
            <div className="input-with-scan">
              <input
                id="materialInput"
                type="text"
                className="input"
                placeholder="Enter material name..."
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
                onKeyDown={handleKeyPress}
                maxLength={50}
                autoFocus
              />
              <button
                type="button"
                className="scan-btn"
                onClick={handleOpenBarcodeScanner}
                title="Scan barcode"
              >
                <Scan size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            title="Save changes"
          >
            <Save size={16} />
            Save
          </button>

          <button
            className="btn btn-warning"
            onClick={handleClear}
            title="Clear pallet"
          >
            <Trash2 size={16} />
            Clear
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleClose}
            title="Cancel"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </div>

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
      />
    </div>
  );
}

export default EditModal;
