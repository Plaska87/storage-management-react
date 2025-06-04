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
   * @returns {string} ZPL code
   */
  generateZPL(labelData) {
    const {
      materialName,
      location,
      palletKey,
      date = new Date(),
      copies = 1,
    } = labelData;

    // Format date as DD/MM/YYYY HH:MM
    const formattedDate = date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Clean material name for barcode (remove special characters)
    const barcodeData = materialName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .toUpperCase();

    // 100x60mm label = 394x236 dots at 203dpi (ZT410 resolution)
    const zplCode = `
^XA
^MMT
^PW394
^LL236
^LS0
^LH0,0
^PON
^MNW
^MTT
^MD15

^FT30,60^A0N,28,28^FH\\^CI28^FDMateriał:^FS^CI27
^FT30,95^A0N,24,24^FH\\^CI28^FD${materialName}^FS^CI27

^FT240,70^BY2,3,50^BCN,,Y,N
^FD${barcodeData}^FS

^FT30,150^A0N,16,16^FH\\^CI28^FDLok: ${location}^FS^CI27

^FT30,175^A0N,14,14^FH\\^CI28^FD${formattedDate}^FS^CI27

^FT30,200^A0N,14,14^FH\\^CI28^FDKlucz: ${palletKey}^FS^CI27

^PQ${copies},0,1,Y
^XZ`;

    return zplCode.trim();
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
        width: 2,
        height: 40,
        displayValue: false,
        margin: 0,
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
    const { materialName, location, palletKey, date = new Date() } = labelData;

    const formattedDate = date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Generate Code128 barcode image
    const barcodeData = materialName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .toUpperCase();
    const barcodeImage = this.generateCode128Image(barcodeData);

    return `
      <div style="
        width: 100mm;
        height: 60mm;
        border: 3px solid #000;
        padding: 4mm;
        font-family: Arial, sans-serif;
        background: white;
        box-sizing: border-box;
        position: relative;
        display: flex;
        color: #000;
      ">
        <!-- Left side: Text content -->
        <div style="
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-right: 4mm;
        ">
          <div style="font-size: 12px; font-weight: 900; margin-bottom: 2mm; color: #000;">
            Materiał:
          </div>
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 4mm; word-wrap: break-word; line-height: 1.2; color: #000;">
            ${materialName}
          </div>

          <div style="margin-top: auto;">
            <div style="font-size: 8px; font-weight: 900; margin-bottom: 1mm; color: #000;">Lok: ${location}</div>
            <div style="font-size: 8px; font-weight: bold; margin-bottom: 1mm; color: #000;">${formattedDate}</div>
            <div style="font-size: 8px; font-weight: bold; color: #000;">Klucz: ${palletKey}</div>
          </div>
        </div>

        <!-- Right side: Barcode -->
        <div style="
          width: 35mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border: 2px solid #000;
          padding: 2mm;
          background: white;
        ">
          <img src="${barcodeImage}" alt="Code128: ${barcodeData}" style="max-width: 100%; max-height: 12mm;" />
          <span style="font-size: 8px; margin-top: 1mm; font-weight: bold; color: #000;">${barcodeData}</span>
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
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .toUpperCase()
      .trim();
  },
};
