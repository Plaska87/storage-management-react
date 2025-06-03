import React, { useRef, useEffect, useState } from "react";
import { Camera, X, Scan } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import "./BarcodeScanner.css";

function BarcodeScanner({ isOpen, onClose, onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [detectedCode, setDetectedCode] = useState("");
  const [continuousScanning, setContinuousScanning] = useState(false);
  const scanningIntervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      initializeCodeReader();
    } else {
      stopCamera();
      stopCodeReader();
    }

    return () => {
      stopCamera();
      stopCodeReader();
    };
  }, [isOpen]);

  const initializeCodeReader = () => {
    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }
  };

  const stopCodeReader = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    stopContinuousScanning();
  };

  const startContinuousScanning = () => {
    if (scanningIntervalRef.current) return; // Already scanning

    setContinuousScanning(true);
    scanningIntervalRef.current = setInterval(() => {
      if (!detectedCode && !isScanning) {
        scanForBarcode();
      }
    }, 1000); // Scan every second
  };

  const stopContinuousScanning = () => {
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current);
      scanningIntervalRef.current = null;
    }
    setContinuousScanning(false);
  };

  const startCamera = async () => {
    try {
      setError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Nie można uzyskać dostępu do kamery. Upewnij się, że uprawnienia do kamery zostały przyznane."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Real barcode detection using ZXing library
  const scanForBarcode = async () => {
    if (!videoRef.current || !codeReaderRef.current) return;

    try {
      setIsScanning(true);
      setError("");

      // Use ZXing to decode barcode from video stream
      const result = await codeReaderRef.current.decodeOnceFromVideoDevice(
        undefined,
        videoRef.current
      );

      if (result) {
        setDetectedCode(result.getText());
        setIsScanning(false);
        console.log(
          "Barcode detected:",
          result.getText(),
          "Format:",
          result.getBarcodeFormat()
        );
      }
    } catch (err) {
      setIsScanning(false);
      if (err instanceof NotFoundException) {
        // No barcode found, this is normal - just continue scanning
        console.log("No barcode found, continuing...");
      } else {
        console.error("Error scanning barcode:", err);
        setError("Błąd skanowania kodu kreskowego. Spróbuj ponownie.");
      }
    }
  };

  const handleManualInput = () => {
    // Allow manual input as fallback
    const code = prompt("Wprowadź kod kreskowy ręcznie:");
    if (code && code.trim()) {
      onScan(code.trim());
      onClose();
    }
  };

  const handleScanClick = () => {
    scanForBarcode();
  };

  const handleUseCode = () => {
    if (detectedCode) {
      onScan(detectedCode);
      onClose();
    }
  };

  const handleClose = () => {
    setDetectedCode("");
    setIsScanning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="barcode-scanner-overlay">
      <div className="barcode-scanner-modal">
        <div className="scanner-header">
          <h3>Skanuj kod kreskowy</h3>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="scanner-content">
          {error ? (
            <div className="error-message">
              <p>{error}</p>
              <button className="manual-input-btn" onClick={handleManualInput}>
                Wprowadź kod ręcznie
              </button>
            </div>
          ) : (
            <>
              <div className="camera-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video"
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />

                <div className="scan-overlay">
                  <div className="scan-frame">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                  </div>
                </div>

                {(isScanning || continuousScanning) && (
                  <div className="scanning-indicator">
                    <div className="scan-line"></div>
                    <p>
                      {continuousScanning
                        ? "Automatyczne skanowanie Code128..."
                        : "Skanowanie..."}
                    </p>
                  </div>
                )}
              </div>

              <div className="scanner-controls">
                {!detectedCode ? (
                  <>
                    <button
                      className="scan-btn"
                      onClick={handleScanClick}
                      disabled={isScanning}
                    >
                      <Scan size={20} />
                      {isScanning ? "Skanowanie..." : "Skanuj raz"}
                    </button>

                    <button
                      className={continuousScanning ? "scan-btn" : "manual-btn"}
                      onClick={
                        continuousScanning
                          ? stopContinuousScanning
                          : startContinuousScanning
                      }
                      disabled={isScanning}
                    >
                      <Camera size={20} />
                      {continuousScanning
                        ? "Zatrzymaj auto-skan"
                        : "Uruchom auto-skan"}
                    </button>

                    <button className="manual-btn" onClick={handleManualInput}>
                      Wprowadź ręcznie
                    </button>
                  </>
                ) : (
                  <div className="detected-code">
                    <p>Wykryty kod:</p>
                    <div className="code-display">{detectedCode}</div>
                    <div className="code-actions">
                      <button className="use-code-btn" onClick={handleUseCode}>
                        Użyj tego kodu
                      </button>
                      <button
                        className="scan-again-btn"
                        onClick={() => setDetectedCode("")}
                      >
                        Skanuj ponownie
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarcodeScanner;
