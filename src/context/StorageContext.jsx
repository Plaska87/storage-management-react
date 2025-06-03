import React, { createContext, useContext, useReducer, useEffect } from "react";

const StorageContext = createContext();

// Constants
export const STORAGE_CONFIG = {
  COLUMNS: 13,
  ROWS: 6,
  PALLETS_PER_CELL: 3,
  FORKLIFT_PATHWAY: { col: 5, startRow: 3 },
};

// Action types
const ACTIONS = {
  SET_STORAGE_DATA: "SET_STORAGE_DATA",
  UPDATE_PALLET: "UPDATE_PALLET",
  CLEAR_PALLET: "CLEAR_PALLET",
  CLEAR_ALL: "CLEAR_ALL",
  SET_SEARCH_TERM: "SET_SEARCH_TERM",
  SET_SEARCH_RESULTS: "SET_SEARCH_RESULTS",
  SET_EDITING_PALLET: "SET_EDITING_PALLET",
  SHOW_TOAST: "SHOW_TOAST",
  HIDE_TOAST: "HIDE_TOAST",
  MOVE_PALLET: "MOVE_PALLET",
};

// Initial state
const initialState = {
  storageData: {},
  searchTerm: "",
  searchResults: [],
  editingPallet: null,
  toast: { show: false, message: "", type: "info" },
};

// Reducer
function storageReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_STORAGE_DATA:
      return { ...state, storageData: action.payload };

    case ACTIONS.UPDATE_PALLET:
      return {
        ...state,
        storageData: {
          ...state.storageData,
          [action.payload.key]: action.payload.material,
        },
      };

    case ACTIONS.CLEAR_PALLET:
      const newData = { ...state.storageData };
      delete newData[action.payload];
      return { ...state, storageData: newData };

    case ACTIONS.CLEAR_ALL:
      return { ...state, storageData: {} };

    case ACTIONS.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };

    case ACTIONS.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };

    case ACTIONS.SET_EDITING_PALLET:
      return { ...state, editingPallet: action.payload };

    case ACTIONS.SHOW_TOAST:
      return {
        ...state,
        toast: {
          show: true,
          message: action.payload.message,
          type: action.payload.type || "info",
        },
      };

    case ACTIONS.HIDE_TOAST:
      return { ...state, toast: { ...state.toast, show: false } };

    case ACTIONS.MOVE_PALLET:
      const { fromKey, toKey } = action.payload;
      const fromMaterial = state.storageData[fromKey];
      const toMaterial = state.storageData[toKey];

      const updatedData = { ...state.storageData };

      if (fromMaterial) {
        if (toMaterial) {
          // Swap materials
          updatedData[fromKey] = toMaterial;
          updatedData[toKey] = fromMaterial;
        } else {
          // Move to empty pallet
          updatedData[toKey] = fromMaterial;
          delete updatedData[fromKey];
        }
      }

      return { ...state, storageData: updatedData };

    default:
      return state;
  }
}

// Provider component
export function StorageProvider({ children }) {
  const [state, dispatch] = useReducer(storageReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("storageData");
      if (savedData) {
        dispatch({
          type: ACTIONS.SET_STORAGE_DATA,
          payload: JSON.parse(savedData),
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  // Auto-save to localStorage when storage data changes
  useEffect(() => {
    try {
      localStorage.setItem("storageData", JSON.stringify(state.storageData));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [state.storageData]);

  // Actions
  const actions = {
    updatePallet: (key, material) => {
      dispatch({
        type: ACTIONS.UPDATE_PALLET,
        payload: { key, material: material || undefined },
      });
    },

    clearPallet: (key) => {
      dispatch({ type: ACTIONS.CLEAR_PALLET, payload: key });
    },

    clearAll: () => {
      if (
        window.confirm(
          "Are you sure you want to clear all storage data? This action cannot be undone."
        )
      ) {
        dispatch({ type: ACTIONS.CLEAR_ALL });
        actions.showToast("All data cleared!", "warning");
      }
    },

    setSearchTerm: (term) => {
      dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: term });
    },

    setSearchResults: (results) => {
      dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: results });
    },

    setEditingPallet: (palletKey) => {
      dispatch({ type: ACTIONS.SET_EDITING_PALLET, payload: palletKey });
    },

    showToast: (message, type = "info") => {
      dispatch({
        type: ACTIONS.SHOW_TOAST,
        payload: { message, type },
      });
    },

    hideToast: () => {
      dispatch({ type: ACTIONS.HIDE_TOAST });
    },

    movePallet: (fromKey, toKey) => {
      dispatch({
        type: ACTIONS.MOVE_PALLET,
        payload: { fromKey, toKey },
      });
      actions.showToast("Pallet moved successfully!", "success");
    },

    saveData: () => {
      try {
        localStorage.setItem("storageData", JSON.stringify(state.storageData));
        actions.showToast("Data saved successfully!", "success");
      } catch (error) {
        actions.showToast("Error saving data!", "error");
      }
    },

    loadData: () => {
      try {
        const savedData = localStorage.getItem("storageData");
        if (savedData) {
          dispatch({
            type: ACTIONS.SET_STORAGE_DATA,
            payload: JSON.parse(savedData),
          });
          actions.showToast("Data loaded successfully!", "success");
        } else {
          actions.showToast("No saved data found", "warning");
        }
      } catch (error) {
        actions.showToast("Error loading data!", "error");
      }
    },

    exportData: () => {
      try {
        const exportData = {
          timestamp: new Date().toISOString(),
          storageData: state.storageData,
          stats: getStats(state.storageData),
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(dataBlob);
        link.download = `storage_export_${
          new Date().toISOString().split("T")[0]
        }.json`;
        link.click();

        actions.showToast("Data exported successfully!", "success");
      } catch (error) {
        actions.showToast("Error exporting data!", "error");
      }
    },
  };

  return (
    <StorageContext.Provider value={{ state, actions }}>
      {children}
    </StorageContext.Provider>
  );
}

// Custom hook to use storage context
export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
}

// Helper function to calculate stats
export function getStats(storageData) {
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

  return {
    totalPallets,
    occupiedCount,
    emptyCount,
    utilization,
  };
}
