import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Scan } from 'lucide-react';
import './BarcodeScanner.css';

function BarcodeScanner({ isOpen, onClose, onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [detectedCode, setDetectedCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Simple barcode detection using canvas and basic pattern recognition
  const scanForBarcode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple barcode detection (this is a basic implementation)
    // In a real app, you'd use a proper barcode library
    const detectedText = detectBarcodePattern(imageData);
    
    if (detectedText) {
      setDetectedCode(detectedText);
      setIsScanning(false);
    }
  };

  // Basic barcode pattern detection (simplified)
  const detectBarcodePattern = (imageData) => {
    // This is a very simplified barcode detection
    // In reality, you'd need a proper barcode decoding library
    // For demo purposes, we'll simulate detection after a few seconds
    return null;
  };

  const handleManualInput = () => {
    // Allow manual input as fallback
    const code = prompt('Enter barcode manually:');
    if (code && code.trim()) {
      onScan(code.trim());
      onClose();
    }
  };

  const handleScanClick = () => {
    setIsScanning(true);
    // Simulate barcode detection after 2 seconds for demo
    setTimeout(() => {
      // In a real implementation, this would be actual barcode detection
      const mockBarcode = 'DEMO-' + Date.now().toString().slice(-6);
      setDetectedCode(mockBarcode);
      setIsScanning(false);
    }, 2000);
  };

  const handleUseCode = () => {
    if (detectedCode) {
      onScan(detectedCode);
      onClose();
    }
  };

  const handleClose = () => {
    setDetectedCode('');
    setIsScanning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="barcode-scanner-overlay">
      <div className="barcode-scanner-modal">
        <div className="scanner-header">
          <h3>Scan Barcode</h3>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="scanner-content">
          {error ? (
            <div className="error-message">
              <p>{error}</p>
              <button className="manual-input-btn" onClick={handleManualInput}>
                Enter Code Manually
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
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                <div className="scan-overlay">
                  <div className="scan-frame">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                  </div>
                </div>

                {isScanning && (
                  <div className="scanning-indicator">
                    <div className="scan-line"></div>
                    <p>Scanning...</p>
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
                      {isScanning ? 'Scanning...' : 'Scan Barcode'}
                    </button>
                    <button className="manual-btn" onClick={handleManualInput}>
                      Enter Manually
                    </button>
                  </>
                ) : (
                  <div className="detected-code">
                    <p>Detected Code:</p>
                    <div className="code-display">{detectedCode}</div>
                    <div className="code-actions">
                      <button className="use-code-btn" onClick={handleUseCode}>
                        Use This Code
                      </button>
                      <button className="scan-again-btn" onClick={() => setDetectedCode('')}>
                        Scan Again
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
