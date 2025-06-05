/**
 * Zebra ZT410 Label Printer Utility
 * Generates ZPL (Zebra Programming Language) code for printing labels
 */
import JsBarcode from "jsbarcode";

export class ZebraLabelPrinter {
  constructor(printerIP = null, printerPort = 9100) {
    this.printerIP = printerIP;
    this.printerPort = printerPort;
  }

  /**
   * Generate ZPL code for material label with Code128 barcode
   * @param {Object} labelData - Label information
   * @param {string} labelData.materialName - Name of the material
   * @param {string} labelData.location - Pallet location (e.g., "Rząd 1, Kolumna A, Paleta 1")
   * @param {string} labelData.palletKey - Pallet key (e.g., "0_0_0")
   * @param {Date} labelData.date - Date for the label
   * @param {number} labelData.copies - Number of copies to print
   * @param {string} labelData.logoZPL - Optional ZPL logo data
   * @returns {string} ZPL code
   */
  generateZPL(labelData) {
    const {
      materialName,
      location,
      date = new Date(),
      copies = 1,
      logoZPL = null,
    } = labelData;

    // Format date as DD/MM/YYYY HH:MM
    const formattedDate = date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Clean material name for barcode (allow letters, numbers, spaces, and hyphens)
    const barcodeData = materialName
      .replace(/[^a-zA-Z0-9\s\-]/g, "")
      .toUpperCase();

    // Generate logo ZPL if not provided
    let logoGraphic = "";
    if (logoZPL) {
      logoGraphic = logoZPL;
    } else {
      // Use a simple AIB logo representation (bigger)
      logoGraphic = `~DGR:LOGO.GRF,960,30,
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
F00000000000000000000000000FF
F0FFFFFF0000000000000000F0FF
F0FFFFFF0000000000000000F0FF
F0FFFFFF0000000000000000F0FF
F0FFFFFF0000000000000000F0FF
F0FFFFFF0000000000000000F0FF
F0FFFFFFFFFFFFFFFFFFFFFFFFFF
F0FFFFFFFFFFFFFFFFFFFFFFFFFF
F0FFFFFFFFFFFFFFFFFFFFFFFFFF
F0FFFFFFFFFFFFFFFFFFFFFFFFFF
F0FFFFFF0000000000000000F0FF
F0FFFFFF0000000000000000F0FF
F0FFFFFF0000000000000000F0FF
F0FFFFFF0000000000000000F0FF
F0FFFFFF0000000000000000F0FF
F00000000000000000000000000FF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF`;
    }

    // Actual label size: 812x479 dots (100x60mm at higher DPI)
    // Full scale label with AIB logo and no pallet key
    const zplCode = `
^XA
^MMT
^PW812
^LL479
^LS0
^LH0,0
^PON
^MNW
^MTT
^MD15

${logoGraphic}

^FO590,18^XGR:LOGO.GRF,1,1^FS

^FT30,80^A0N,70,70^FH\\^CI28^FD${materialName}^FS^CI27

^FT30,180^A0N,35,35^FH\\^CI28^FDLokalizacja: ${location}^FS^CI27
^FT30,220^A0N,30,30^FH\\^CI28^FDData: ${formattedDate}^FS^CI27

^FO30,250^GB750,3,3^FS

^FT30,420^BY4,3,120^BCN,,Y,N
^FD${barcodeData}^FS

^PQ${copies},0,1,Y
^XZ`;

    return zplCode.trim();
  }

  /**
   * Generate ZPL graphic from logo image
   * @param {string} logoUrl - Logo image URL
   * @returns {Promise<string>} ZPL graphic string
   */
  async generateLogoZPL(logoUrl) {
    if (!logoUrl) return null;

    try {
      // Logo size 1.5x bigger: 180x90 dots (1.5 times the previous size)
      const logoData = await this.convertImageToZPL(logoUrl, 180, 90);
      return logoData.zplGraphic;
    } catch (error) {
      console.warn("Failed to convert logo, using fallback:", error);
      return null;
    }
  }

  /**
   * Convert image to ZPL graphic format
   * @param {string} imageUrl - URL or data URL of the image
   * @param {number} maxWidth - Maximum width in dots
   * @param {number} maxHeight - Maximum height in dots
   * @returns {Promise<string>} ZPL graphic data
   */
  async convertImageToZPL(imageUrl, maxWidth = 100, maxHeight = 50) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate scaled dimensions
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        const width = Math.floor(img.width * scale);
        const height = Math.floor(img.height * scale);

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to monochrome bitmap
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        let hexString = "";
        const bytesPerRow = Math.ceil(width / 8);

        for (let y = 0; y < height; y++) {
          for (let byteIndex = 0; byteIndex < bytesPerRow; byteIndex++) {
            let byte = 0;
            for (let bit = 0; bit < 8; bit++) {
              const x = byteIndex * 8 + bit;
              if (x < width) {
                const pixelIndex = (y * width + x) * 4;
                const r = data[pixelIndex];
                const g = data[pixelIndex + 1];
                const b = data[pixelIndex + 2];
                const brightness = (r + g + b) / 3;

                if (brightness < 128) {
                  // Black pixel
                  byte |= 1 << (7 - bit);
                }
              }
            }
            hexString += byte.toString(16).padStart(2, "0").toUpperCase();
          }
        }

        resolve({
          width,
          height,
          bytesPerRow,
          hexData: hexString,
          zplGraphic: `~DGR:LOGO.GRF,${
            hexString.length / 2
          },${bytesPerRow},\n${hexString}`,
        });
      };

      img.onerror = () => {
        // Fallback to simple AIB text representation
        resolve({
          width: 60,
          height: 30,
          bytesPerRow: 8,
          hexData: "",
          zplGraphic: `~DGR:LOGO.GRF,240,8,\n${"00".repeat(240)}`,
        });
      };

      img.src = imageUrl;
    });
  }

  /**
   * Generate Code128 barcode as image data URL
   * @param {string} data - Data to encode
   * @returns {string} Image data URL
   */
  generateCode128Image(data) {
    try {
      // Create a temporary canvas to generate the barcode
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, data, {
        format: "CODE128",
        width: 3,
        height: 60,
        displayValue: false,
        margin: 5,
        background: "#ffffff",
        lineColor: "#000000",
      });

      // Convert canvas to data URL
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error generating Code128 barcode:", error);
      // Fallback to simple bars representation
      return (
        "data:image/svg+xml;base64," +
        btoa(`
        <svg width="200" height="40" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="2" height="40" fill="black"/>
          <rect x="4" y="0" width="1" height="40" fill="black"/>
          <rect x="7" y="0" width="3" height="40" fill="black"/>
          <rect x="12" y="0" width="1" height="40" fill="black"/>
          <rect x="15" y="0" width="2" height="40" fill="black"/>
          <rect x="19" y="0" width="1" height="40" fill="black"/>
          <rect x="22" y="0" width="2" height="40" fill="black"/>
          <rect x="26" y="0" width="3" height="40" fill="black"/>
          <rect x="31" y="0" width="1" height="40" fill="black"/>
          <rect x="34" y="0" width="2" height="40" fill="black"/>
        </svg>
      `)
      );
    }
  }

  /**
   * Generate preview HTML for the label
   * @param {Object} labelData - Label information
   * @returns {string} HTML preview
   */
  generatePreview(labelData) {
    const {
      materialName,
      location,
      date = new Date(),
      logoUrl = null,
    } = labelData;

    const formattedDate = date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Generate Code128 barcode image (allow letters, numbers, spaces, and hyphens)
    const barcodeData = materialName
      .replace(/[^a-zA-Z0-9\s\-]/g, "")
      .toUpperCase();
    const barcodeImage = this.generateCode128Image(barcodeData);

    return `
      <div style="
        width: 100mm;
        height: 60mm;
        border: 2px solid #333;
        padding: 2mm;
        font-family: 'Arial Black', Arial, sans-serif;
        background: white;
        box-sizing: border-box;
        position: relative;
        color: #000;
      ">
        <!-- AIB Logo in top right corner -->
        <div style="
          position: absolute;
          top: 2mm;
          right: 2mm;
          width: 30mm;
          height: 18mm;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${
            logoUrl
              ? `<img src="${logoUrl}" alt="AIB Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;" />`
              : `<div style="background: #000; color: white; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; letter-spacing: 2px; font-family: Arial, sans-serif;">+AIB</div>`
          }
        </div>

        <!-- Material Name - Large and Prominent -->
        <div style="
          font-size: 18px;
          font-weight: normal;
          margin-bottom: 4mm;
          margin-top: 4mm;
          word-wrap: break-word;
          line-height: 1.2;
          color: #000;
          min-height: 8mm;
        ">
          ${materialName}
        </div>

        <!-- Location Information -->
        <div style="
          font-size: 10px;
          font-weight: normal;
          margin-bottom: 1mm;
          color: #000;
          line-height: 1.1;
        ">
          Lokalizacja: ${location}
        </div>

        <!-- Date Information -->
        <div style="
          font-size: 9px;
          font-weight: normal;
          margin-bottom: 4mm;
          color: #000;
          line-height: 1.1;
        ">
          Data: ${formattedDate}
        </div>

        <!-- Horizontal Line -->
        <div style="
          width: 94mm;
          height: 2px;
          background: #000;
          margin: 2mm 0;
        "></div>

        <!-- Barcode Section - Full Width -->
        <div style="
          text-align: center;
          background: white;
          margin-top: 2mm;
        ">
          <img src="${barcodeImage}" alt="Code128: ${barcodeData}" style="
            width: 94mm;
            height: 18mm;
            object-fit: contain;
          " />
          <div style="
            font-size: 8px;
            font-weight: bold;
            color: #000;
            margin-top: 1mm;
            letter-spacing: 1px;
          ">
            ${barcodeData}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Send ZPL to printer via network
   * @param {string} zplCode - ZPL code to send
   * @returns {Promise<boolean>} Success status
   */
  async sendToPrinter(zplCode) {
    if (!this.printerIP) {
      throw new Error("Adres IP drukarki nie został ustawiony");
    }

    try {
      // Note: Direct network printing from browser requires CORS proxy or browser extension
      // This is a placeholder for the actual implementation
      const response = await fetch(
        `http://${this.printerIP}:${this.printerPort}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: zplCode,
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Błąd podczas wysyłania do drukarki:", error);
      throw new Error(
        "Nie można połączyć się z drukarką. Sprawdź połączenie sieciowe."
      );
    }
  }

  /**
   * Download ZPL file for manual printing
   * @param {string} zplCode - ZPL code
   * @param {string} filename - Filename for download
   */
  downloadZPL(zplCode, filename = "label.zpl") {
    const blob = new Blob([zplCode], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Print via browser print dialog (converts to printable format)
   * @param {string} previewHTML - HTML preview of the label
   */
  printViaBrowser(previewHTML) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Etykieta materiału</title>
        <style>
          @media print {
            body { margin: 0; }
            @page { size: 100mm 60mm; margin: 0; }
          }
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        ${previewHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  /**
   * Set printer IP address
   * @param {string} ip - Printer IP address
   * @param {number} port - Printer port (default: 9100)
   */
  setPrinterIP(ip, port = 9100) {
    this.printerIP = ip;
    this.printerPort = port;
  }

  /**
   * Test printer connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    if (!this.printerIP) {
      throw new Error("Adres IP drukarki nie został ustawiony");
    }

    try {
      // Send a simple status request
      const testZPL = "^XA^HH^XZ"; // Host status return
      const response = await fetch(
        `http://${this.printerIP}:${this.printerPort}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: testZPL,
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Test połączenia nieudany:", error);
      return false;
    }
  }
}

// Default instance
export const zebraLabelPrinter = new ZebraLabelPrinter();

// Utility functions
export const ZPLUtils = {
  /**
   * Escape special characters for ZPL
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeZPL: (text) => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/\^/g, "\\^")
      .replace(/~/g, "\\~");
  },

  /**
   * Validate material name for barcode
   * @param {string} materialName - Material name
   * @returns {boolean} Is valid
   */
  isValidForBarcode: (materialName) => {
    return materialName && materialName.trim().length > 0;
  },

  /**
   * Clean text for barcode data
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  cleanForBarcode: (text) => {
    return text
      .replace(/[^a-zA-Z0-9\s\-]/g, "")
      .toUpperCase()
      .trim();
  },
};
