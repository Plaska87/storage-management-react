import React, { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import "./SearchPanel.css";

const STORAGE_CONFIG = {
  COLUMNS: 13,
  ROWS: 6,
  PALLETS_PER_CELL: 3,
  FORKLIFT_PATHWAY: { col: 5, startRow: 3 },
};

function SearchPanel({
  storageData,
  searchTerm,
  setSearchTerm,
  searchResults,
  setSearchResults,
  setHighlightedPallet,
}) {
  const [searchInput, setSearchInput] = useState("");

  // Immediate search function for hints
  const performSearch = useCallback(
    (searchTerm) => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      const results = [];
      const searchLower = searchTerm.toLowerCase();

      Object.entries(storageData).forEach(([palletKey, material]) => {
        if (material && material.toLowerCase().includes(searchLower)) {
          const [row, col, palletIdx] = palletKey.split("_").map(Number);
          const columnLetter = String.fromCharCode(65 + col);

          results.push({
            palletKey,
            material,
            coordinates: `Rząd ${row + 1}, Kolumna ${columnLetter}, Paleta ${
              palletIdx + 1
            }`,
            row,
            col,
            palletIdx,
          });
        }
      });

      // Sort results by relevance (exact matches first, then partial matches)
      results.sort((a, b) => {
        const aExact = a.material.toLowerCase() === searchLower;
        const bExact = b.material.toLowerCase() === searchLower;
        const aStarts = a.material.toLowerCase().startsWith(searchLower);
        const bStarts = b.material.toLowerCase().startsWith(searchLower);

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.material.localeCompare(b.material);
      });

      // Limit results to top 8 for better UX
      setSearchResults(results.slice(0, 8));
    },
    [storageData, setSearchResults]
  );

  // Immediate search for hints, debounced for external searchTerm
  useEffect(() => {
    // Show hints immediately
    performSearch(searchInput);

    // Update external searchTerm with debounce
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, performSearch, setSearchTerm]);

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleResultClick = (palletKey) => {
    // Scroll to pallet and highlight it
    const palletElement = document.querySelector(
      `[data-pallet-key="${palletKey}"]`
    );
    if (palletElement) {
      palletElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });

      // Set the specific pallet to be highlighted
      setHighlightedPallet(palletKey);

      // Clear the highlight after 3 seconds
      setTimeout(() => {
        setHighlightedPallet(null);
      }, 3000);
    }

    // Clear search input and hide hints list
    setSearchInput("");
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <div className="search-panel card">
      <div className="search-container">
        <div className="search-input-wrapper">
          <div className="search-input-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Szukaj materiałów..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              maxLength={50}
            />
            {searchInput && (
              <button
                className="search-clear-btn"
                onClick={handleClearSearch}
                title="Wyczyść wyszukiwanie"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {searchInput && searchResults.length > 0 && (
          <div className="search-results">
            <div className="search-results-header">
              {searchResults.length === 8 ? "Top 8" : searchResults.length}{" "}
              wynik
              {searchResults.length !== 1 ? "ów" : ""} - Kliknij aby przejść
            </div>
            <div className="search-results-list">
              {searchResults.map((result) => (
                <div
                  key={result.palletKey}
                  className="search-result-item"
                  onClick={() => handleResultClick(result.palletKey)}
                  title={`Kliknij aby przejść do ${result.material} w ${result.coordinates}`}
                >
                  <div className="search-result-material">
                    {result.material}
                  </div>
                  <div className="search-result-location">
                    📍 {result.coordinates}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchInput && searchResults.length === 0 && (
          <div className="search-results">
            <div className="search-result-item no-results">
              Nie znaleziono materiałów pasujących do "{searchInput}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPanel;
