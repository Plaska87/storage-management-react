import React, { useState, useEffect } from "react";
import {
  X,
  Printer,
  Download,
  Eye,
  Settings,
  Wifi,
  WifiOff,
} from "lucide-react";
import { zebraLabelPrinter, ZPLUtils } from "../utils/ZebraLabelPrinter";
import { useStorage } from "../context/StorageContext";
import aibLogo from "../assets/aib-logo.png";
import "./LabelPrintModal.css";

function LabelPrintModal({
  isOpen,
  onClose,
  materialName,
  palletLocation,
  palletKey,
}) {
  const { actions } = useStorage();
  const [copies, setCopies] = useState(1);
  const [printerIP, setPrinterIP] = useState(
    localStorage.getItem("zebraPrinterIP") || ""
  );
  const [showSettings, setShowSettings] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [previewHTML, setPreviewHTML] = useState("");
  const [zplCode, setZPLCode] = useState("");

  // Generate label data when modal opens
  useEffect(() => {
    if (isOpen && materialName) {
      const generateLabel = async () => {
        try {
          // First, convert the logo to ZPL format
          console.log("Converting logo:", aibLogo);
          const logoZPL = await zebraLabelPrinter.generateLogoZPL(aibLogo);
          console.log("Logo ZPL generated:", logoZPL ? "Success" : "Failed");

          const labelData = {
            materialName,
            location: palletLocation,
            palletKey,
            date: new Date(),
            copies,
            logoZPL: logoZPL,
            logoUrl: aibLogo,
          };

          const zpl = zebraLabelPrinter.generateZPL(labelData);
          const preview = zebraLabelPrinter.generatePreview(labelData);

          setZPLCode(zpl);
          setPreviewHTML(preview);
        } catch (error) {
          console.error("Error generating label:", error);
          // Fallback without logo
          const fallbackData = {
            materialName,
            location: palletLocation,
            palletKey,
            date: new Date(),
            copies,
            logoZPL: null,
            logoUrl: null,
          };
          const zpl = zebraLabelPrinter.generateZPL(fallbackData);
          const preview = zebraLabelPrinter.generatePreview(fallbackData);

          setZPLCode(zpl);
          setPreviewHTML(preview);
        }
      };

      generateLabel();
    }
  }, [isOpen, materialName, palletLocation, palletKey, copies]);

  // Update printer IP when changed
  useEffect(() => {
    if (printerIP) {
      zebraLabelPrinter.setPrinterIP(printerIP);
      localStorage.setItem("zebraPrinterIP", printerIP);
    }
  }, [printerIP]);

  const handleTestConnection = async () => {
    if (!printerIP) {
      actions.showToast("Wprowadź adres IP drukarki", "warning");
      return;
    }

    setIsConnecting(true);
    try {
      const connected = await zebraLabelPrinter.testConnection();
      setIsConnected(connected);
      actions.showToast(
        connected
          ? "Połączenie z drukarką udane!"
          : "Nie można połączyć się z drukarką",
        connected ? "success" : "error"
      );
    } catch (error) {
      setIsConnected(false);
      actions.showToast("Błąd połączenia: " + error.message, "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePrintToPrinter = async () => {
    if (!printerIP) {
      actions.showToast("Wprowadź adres IP drukarki", "warning");
      setShowSettings(true);
      return;
    }

    if (!ZPLUtils.isValidForBarcode(materialName)) {
      actions.showToast(
        "Nieprawidłowa nazwa materiału dla kodu kreskowego",
        "error"
      );
      return;
    }

    try {
      await zebraLabelPrinter.sendToPrinter(zplCode);
      actions.showToast(
        `Etykieta została wysłana do drukarki (${copies} kopii)`,
        "success"
      );
      onClose();
    } catch (error) {
      actions.showToast("Błąd drukowania: " + error.message, "error");
    }
  };

  const handleDownloadZPL = () => {
    const filename = `etykieta_${materialName.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${Date.now()}.zpl`;
    zebraLabelPrinter.downloadZPL(zplCode, filename);
    actions.showToast("Plik ZPL został pobrany", "success");
  };

  const handlePrintViaBrowser = () => {
    zebraLabelPrinter.printViaBrowser(previewHTML);
    actions.showToast("Otwarto okno drukowania", "info");
  };

  const handlePreview = () => {
    const previewWindow = window.open("", "_blank", "width=600,height=400");
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Podgląd etykiety - ${materialName}</title>
        <style>
          body { 
            margin: 20px; 
            font-family: Arial, sans-serif;
            background: #f5f5f5;
          }
          .preview-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 300px;
          }
        </style>
      </head>
      <body>
        <h2>Podgląd etykiety</h2>
        <div class="preview-container">
          ${previewHTML}
        </div>
        <p><strong>Materiał:</strong> ${materialName}</p>
        <p><strong>Lokalizacja:</strong> ${palletLocation}</p>
        <p><strong>Liczba kopii:</strong> ${copies}</p>
      </body>
      </html>
    `);
    previewWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <div className="label-print-overlay">
      <div className="label-print-modal">
        <div className="modal-header">
          <h3>Drukuj etykietę materiału</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="label-info">
            <h4>Informacje o etykiecie</h4>
            <div className="info-row">
              <strong>Materiał:</strong> {materialName}
            </div>
            <div className="info-row">
              <strong>Lokalizacja:</strong> {palletLocation}
            </div>
            <div className="info-row">
              <strong>Klucz palety:</strong> {palletKey}
            </div>
          </div>

          <div className="print-options">
            <div className="option-group">
              <label htmlFor="copies">Liczba kopii:</label>
              <input
                id="copies"
                type="number"
                min="1"
                max="10"
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                className="copies-input"
              />
            </div>

            {showSettings && (
              <div className="printer-settings">
                <h4>Ustawienia drukarki</h4>
                <div className="option-group">
                  <label htmlFor="printerIP">
                    Adres IP drukarki Zebra ZT410:
                  </label>
                  <div className="ip-input-group">
                    <input
                      id="printerIP"
                      type="text"
                      placeholder="192.168.1.100"
                      value={printerIP}
                      onChange={(e) => setPrinterIP(e.target.value)}
                      className="ip-input"
                    />
                    <button
                      className="test-connection-btn"
                      onClick={handleTestConnection}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        "Testowanie..."
                      ) : isConnected ? (
                        <>
                          <Wifi size={16} /> Połączono
                        </>
                      ) : (
                        <>
                          <WifiOff size={16} /> Testuj
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="preview-section">
            <h4>Podgląd etykiety</h4>
            <div
              className="label-preview"
              dangerouslySetInnerHTML={{ __html: previewHTML }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={handlePrintToPrinter}
            title="Drukuj bezpośrednio na drukarce Zebra"
          >
            <Printer size={16} />
            Drukuj na Zebra ZT410
          </button>

          <button
            className="btn btn-secondary"
            onClick={handlePrintViaBrowser}
            title="Drukuj przez przeglądarkę"
          >
            <Printer size={16} />
            Drukuj przez przeglądarkę
          </button>

          <button
            className="btn btn-info"
            onClick={handleDownloadZPL}
            title="Pobierz plik ZPL"
          >
            <Download size={16} />
            Pobierz ZPL
          </button>

          <button
            className="btn btn-outline"
            onClick={handlePreview}
            title="Podgląd w nowym oknie"
          >
            <Eye size={16} />
            Podgląd
          </button>

          <button
            className="btn btn-outline"
            onClick={() => setShowSettings(!showSettings)}
            title="Ustawienia drukarki"
          >
            <Settings size={16} />
            Ustawienia
          </button>
        </div>
      </div>
    </div>
  );
}

export default LabelPrintModal;
