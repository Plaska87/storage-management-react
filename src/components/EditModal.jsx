import React, { useState, useEffect } from "react";
import { X, Save, Trash2, Package, Scan, Printer } from "lucide-react";
import { useStorage } from "../context/StorageContext";
import BarcodeScanner from "./BarcodeScanner";
import LabelPrintModal from "./LabelPrintModal";
import "./EditModal.css";

function EditModal() {
  const { state, actions } = useStorage();
  const [materialInput, setMaterialInput] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showLabelPrintModal, setShowLabelPrintModal] = useState(false);
  const [savedMaterial, setSavedMaterial] = useState("");

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

    return `Rząd ${row + 1}, Kolumna ${columnLetter}, Paleta ${palletIdx + 1}`;
  };

  const handleSave = () => {
    if (state.editingPallet) {
      const trimmedMaterial = materialInput.trim();
      actions.updatePallet(state.editingPallet, trimmedMaterial);
      setSavedMaterial(trimmedMaterial);
      actions.showToast("Zmiany zostały zapisane!", "success");

      // If material was added (not just cleared), show print option
      if (trimmedMaterial) {
        setTimeout(() => {
          setShowLabelPrintModal(true);
        }, 500);
      } else {
        handleClose();
      }
    }
  };

  const handleClear = () => {
    if (state.editingPallet) {
      actions.clearPallet(state.editingPallet);
      actions.showToast("Paleta została wyczyszczona!", "warning");
      handleClose();
    }
  };

  const handleClose = () => {
    actions.setEditingPallet(null);
    setMaterialInput("");
    setSavedMaterial("");
    setShowLabelPrintModal(false);
  };

  const handlePrintLabel = () => {
    if (savedMaterial && state.editingPallet) {
      setShowLabelPrintModal(true);
    }
  };

  const handleLabelPrintClose = () => {
    setShowLabelPrintModal(false);
    handleClose();
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
    actions.showToast("Kod kreskowy został zeskanowany!", "success");
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
            <h2>Edytuj zawartość palety</h2>
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
          <div className="pallet-info">
            <strong>Lokalizacja:</strong> {getPalletInfo()}
          </div>

          <div className="current-content">
            <strong>Aktualna zawartość:</strong>{" "}
            <span className={currentMaterial ? "has-content" : "empty-content"}>
              {currentMaterial || "Pusta"}
            </span>
          </div>

          <div className="input-group">
            <label htmlFor="materialInput">Materiał:</label>
            <div className="input-with-scan">
              <input
                id="materialInput"
                type="text"
                className="input"
                placeholder="Wprowadź nazwę materiału..."
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
                title="Skanuj kod kreskowy"
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
            title="Zapisz zmiany"
          >
            <Save size={16} />
            Zapisz
          </button>

          {savedMaterial && (
            <button
              className="btn btn-info"
              onClick={handlePrintLabel}
              title="Drukuj etykietę"
            >
              <Printer size={16} />
              Drukuj etykietę
            </button>
          )}

          <button
            className="btn btn-warning"
            onClick={handleClear}
            title="Wyczyść paletę"
          >
            <Trash2 size={16} />
            Wyczyść
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleClose}
            title="Anuluj"
          >
            <X size={16} />
            Anuluj
          </button>
        </div>
      </div>

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
      />

      {/* Label Print Modal */}
      <LabelPrintModal
        isOpen={showLabelPrintModal}
        onClose={handleLabelPrintClose}
        materialName={savedMaterial}
        palletLocation={getPalletInfo()}
        palletKey={state.editingPallet}
      />
    </div>
  );
}

export default EditModal;
