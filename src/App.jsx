import React, { useState } from "react";
import SearchPanel from "./components/SearchPanel";
import "./App.css";
import "./components/SearchPanel.css";

// Simple Storage Context without external dependencies
const STORAGE_CONFIG = {
  COLUMNS: 13,
  ROWS: 6,
  PALLETS_PER_CELL: 3,
  FORKLIFT_PATHWAY: { col: 5, startRow: 3 },
};

function App() {
  const [storageData, setStorageData] = useState({});
  const [editingPallet, setEditingPallet] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedPallet, setHighlightedPallet] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Helper functions
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      3000
    );
  };

  const updatePallet = (key, material) => {
    setStorageData((prev) => ({
      ...prev,
      [key]: material || undefined,
    }));
    showToast("Paleta zaktualizowana!", "success");
  };

  const clearPallet = (key) => {
    setStorageData((prev) => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });
    showToast("Paleta wyczyszczona!", "warning");
  };

  const getStats = () => {
    const totalPallets =
      STORAGE_CONFIG.ROWS *
        STORAGE_CONFIG.COLUMNS *
        STORAGE_CONFIG.PALLETS_PER_CELL -
      3 * STORAGE_CONFIG.PALLETS_PER_CELL; // Subtract forklift pathway
    const occupiedCount = Object.values(storageData).filter(
      (material) => material && material.trim()
    ).length;
    const emptyCount = totalPallets - occupiedCount;
    const utilization =
      totalPallets > 0 ? Math.round((occupiedCount / totalPallets) * 100) : 0;

    return { totalPallets, occupiedCount, emptyCount, utilization };
  };

  return (
    <div className="app">
      {/* Header */}
      <header
        className="card"
        style={{
          marginBottom: "8px",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#64b5f6",
          }}
        >
          <span style={{ fontSize: "24px" }}>🏭</span>
          <h1 style={{ margin: 0, fontSize: "1.8em", fontWeight: 700 }}>
            System Zarządzania Magazynem
          </h1>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={() => showToast("Dane zapisane!", "success")}
          >
            💾 Zapisz Dane
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => showToast("Dane wczytane!", "success")}
          >
            📂 Wczytaj Dane
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm("Wyczyścić wszystkie dane?")) {
                setStorageData({});
                showToast("Wszystkie dane wyczyszczone!", "warning");
              }
            }}
          >
            🗑️ Wyczyść Wszystko
          </button>
        </div>
      </header>

      {/* Search Panel */}
      <SearchPanel
        storageData={storageData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        setHighlightedPallet={setHighlightedPallet}
      />

      {/* Stats Panel */}
      <div className="card" style={{ marginBottom: "8px", padding: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {[
            {
              label: "Łączna Liczba Palet",
              value: getStats().totalPallets,
              color: "#64b5f6",
              icon: "📦",
            },
            {
              label: "Zajęte",
              value: getStats().occupiedCount,
              color: "#39c96e",
              icon: "✅",
            },
            {
              label: "Puste",
              value: getStats().emptyCount,
              color: "#b0bec5",
              icon: "⬜",
            },
            {
              label: "Wykorzystanie",
              value: `${getStats().utilization}%`,
              color: getStats().utilization > 80 ? "#e74c3c" : "#39c96e",
              icon: "📊",
            },
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                background: "rgba(15, 52, 96, 0.6)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <span style={{ fontSize: "20px" }}>{stat.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#b0bec5",
                    marginBottom: "4px",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Grid */}
      <div
        className="card"
        style={{
          flex: 1,
          padding: "12px",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Column headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px repeat(13, minmax(160px, 1fr))",
            gap: "4px",
            marginBottom: "8px",
            minWidth: "2140px", // 60px + (13 * 160px) + (13 * 4px) = 2192px
          }}
        >
          <div
            style={{
              background: "rgba(15, 52, 96, 0.9)",
              borderRadius: "6px",
              minHeight: "32px",
            }}
          ></div>
          {Array.from({ length: STORAGE_CONFIG.COLUMNS }, (_, i) => (
            <div
              key={i}
              style={{
                background: "rgba(15, 52, 96, 0.9)",
                color: "#64b5f6",
                padding: "8px",
                textAlign: "center",
                fontWeight: "bold",
                borderRadius: "6px",
                fontSize: "14px",
                border: "1px solid rgba(100, 181, 246, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "32px",
              }}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>

        {/* Storage grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px repeat(13, minmax(160px, 1fr))",
            gap: "4px",
            flex: 1,
            minWidth: "2140px", // 60px + (13 * 160px) + (13 * 4px) = 2192px
          }}
        >
          {Array.from({ length: STORAGE_CONFIG.ROWS }, (_, row) => [
            // Row header
            <div
              key={`row-${row}`}
              style={{
                background: "rgba(15, 52, 96, 0.9)",
                color: "#64b5f6",
                padding: "8px",
                textAlign: "center",
                fontWeight: "bold",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                border: "1px solid rgba(100, 181, 246, 0.3)",
                minHeight: "70px",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
              }}
            >
              Rząd {row + 1}
            </div>,

            // Cells for this row
            ...Array.from({ length: STORAGE_CONFIG.COLUMNS }, (_, col) => {
              // Check if this is forklift pathway
              if (
                col === STORAGE_CONFIG.FORKLIFT_PATHWAY.col &&
                row >= STORAGE_CONFIG.FORKLIFT_PATHWAY.startRow
              ) {
                return (
                  <div
                    key={`pathway-${row}-${col}`}
                    style={{
                      background:
                        "linear-gradient(45deg, rgba(241, 196, 15, 0.8), rgba(243, 156, 18, 0.8))",
                      borderColor: "rgba(230, 126, 34, 0.8)",
                      border: "1px solid rgba(230, 126, 34, 0.8)",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      color: "#1a1a2e",
                      textAlign: "center",
                      fontSize: "10px",
                      minHeight: "70px",
                    }}
                  >
                    🚛
                    <br />
                    ŚCIEŻKA
                    <br />
                    WÓZKA
                  </div>
                );
              }

              // Normal storage cell with pallets
              return (
                <div
                  key={`cell-${row}-${col}`}
                  style={{
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    padding: "4px",
                    background: "rgba(15, 52, 96, 0.6)",
                    minHeight: "80px",
                    display: "flex",
                    flexDirection: "row",
                    gap: "3px",
                  }}
                >
                  {Array.from(
                    { length: STORAGE_CONFIG.PALLETS_PER_CELL },
                    (_, palletIdx) => {
                      const palletKey = `${row}_${col}_${palletIdx}`;
                      const material = storageData[palletKey] || "";
                      const isEmpty = !material || material.trim() === "";
                      const isHighlighted = highlightedPallet === palletKey;

                      return (
                        <div
                          key={palletKey}
                          data-pallet-key={palletKey}
                          className={isHighlighted ? "search-highlight" : ""}
                          onClick={() => setEditingPallet(palletKey)}
                          style={{
                            flex: 1,
                            border: `1px solid ${
                              isHighlighted
                                ? "#46cc71"
                                : "rgba(255, 255, 255, 0.3)"
                            }`,
                            borderRadius: "4px",
                            padding: "4px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            background: isEmpty
                              ? "rgba(26, 26, 46, 0.8)"
                              : isHighlighted
                              ? "linear-gradient(135deg, rgba(46, 204, 113, 0.8), rgba(39, 174, 96, 0.9))"
                              : "linear-gradient(135deg, rgba(100, 181, 246, 0.8), rgba(33, 150, 243, 0.9))",
                            color: isEmpty ? "#b0bec5" : "white",
                            fontSize: "10px",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            minHeight: "60px",
                            minWidth: "45px",
                            fontWeight: isEmpty ? "normal" : "600",
                            textShadow: isEmpty
                              ? "none"
                              : "0 1px 2px rgba(0, 0, 0, 0.3)",
                            boxShadow: isHighlighted
                              ? "0 0 10px rgba(46, 204, 113, 0.5)"
                              : "none",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.03)";
                            e.target.style.boxShadow =
                              "0 4px 12px rgba(100, 181, 246, 0.3)";
                            e.target.style.borderColor =
                              "rgba(100, 181, 246, 0.6)";
                            e.target.style.zIndex = "2";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                            e.target.style.boxShadow = isHighlighted
                              ? "0 0 10px rgba(46, 204, 113, 0.5)"
                              : "none";
                            e.target.style.borderColor = isHighlighted
                              ? "#46cc71"
                              : "rgba(255, 255, 255, 0.3)";
                            e.target.style.zIndex = "1";
                          }}
                          title={
                            isEmpty
                              ? "Kliknij aby dodać materiał"
                              : `${material} - Kliknij aby edytować`
                          }
                        >
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: "9px",
                              opacity: 0.9,
                            }}
                          >
                            P{palletIdx + 1}
                          </div>
                          <div
                            style={{
                              fontSize: "8px",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "normal",
                              overflow: "hidden",
                              lineHeight: 1.1,
                              flex: 1,
                              textAlign: "center",
                              padding: "2px 1px",
                              display: "block",
                            }}
                          >
                            {isEmpty ? (
                              <span
                                style={{ fontStyle: "italic", opacity: 0.7 }}
                              >
                                Puste
                              </span>
                            ) : (
                              <span style={{ fontWeight: "600" }}>
                                {material}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              );
            }),
          ]).flat()}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPallet && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingPallet(null);
            }
          }}
        >
          <div
            className="card"
            style={{
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "hidden",
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "#64b5f6",
                }}
              >
                <span style={{ fontSize: "20px" }}>📦</span>
                <h2 style={{ margin: 0, fontSize: "1.3em", fontWeight: 600 }}>
                  Edytuj Zawartość Palety
                </h2>
              </div>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#b0bec5",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  fontSize: "20px",
                }}
                onClick={() => setEditingPallet(null)}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {(() => {
                const [row, col, palletIdx] = editingPallet
                  .split("_")
                  .map(Number);
                const columnLetter = String.fromCharCode(65 + col);
                const currentMaterial = storageData[editingPallet] || "";

                return (
                  <>
                    <div
                      style={{
                        padding: "12px",
                        background: "rgba(15, 52, 96, 0.6)",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <strong>Lokalizacja:</strong> Rząd {row + 1}, Kolumna{" "}
                      {columnLetter}, Paleta {palletIdx + 1}
                    </div>

                    <div
                      style={{
                        padding: "12px",
                        background: "rgba(15, 52, 96, 0.6)",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <strong>Aktualna Zawartość:</strong>{" "}
                      <span
                        style={{
                          color: currentMaterial ? "#64b5f6" : "#b0bec5",
                          fontWeight: currentMaterial ? 600 : "normal",
                          fontStyle: currentMaterial ? "normal" : "italic",
                        }}
                      >
                        {currentMaterial || "Puste"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <label
                        style={{
                          fontWeight: 600,
                          color: "#64b5f6",
                          fontSize: "14px",
                        }}
                      >
                        Materiał:
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Wprowadź nazwę materiału..."
                        defaultValue={currentMaterial}
                        maxLength={50}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updatePallet(editingPallet, e.target.value.trim());
                            setEditingPallet(null);
                          } else if (e.key === "Escape") {
                            setEditingPallet(null);
                          }
                        }}
                        id="materialInput"
                      />
                    </div>
                  </>
                );
              })()}
            </div>

            <div
              style={{
                padding: "20px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn btn-primary"
                onClick={() => {
                  const input = document.getElementById("materialInput");
                  updatePallet(editingPallet, input.value.trim());
                  setEditingPallet(null);
                }}
              >
                💾 Zapisz
              </button>

              <button
                className="btn btn-warning"
                onClick={() => {
                  clearPallet(editingPallet);
                  setEditingPallet(null);
                }}
              >
                🗑️ Wyczyść
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setEditingPallet(null)}
              >
                ✕ Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "16px",
            borderRadius: "8px",
            color: "white",
            fontWeight: "500",
            zIndex: 1000,
            animation: "slideIn 0.3s ease-out",
            background:
              toast.type === "success"
                ? "rgba(39, 174, 96, 0.95)"
                : toast.type === "warning"
                ? "rgba(243, 156, 18, 0.95)"
                : toast.type === "error"
                ? "rgba(231, 76, 60, 0.95)"
                : "rgba(52, 152, 219, 0.95)",
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
