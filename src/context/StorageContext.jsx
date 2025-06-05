import React, { createContext, useContext, useReducer, useEffect } from "react";

const StorageContext = createContext();

// API Configuration
const API_BASE_URL = "http://localhost:3002/api";

// Constants
export const STORAGE_CONFIG = {
  COLUMNS: 13,
  ROWS: 6,
  PALLETS_PER_CELL: 3,
  FORKLIFT_PATHWAY: { col: 5, startRow: 3 },
};

// API Service Functions
const apiService = {
  // Get all materials from database
  async getMaterials() {
    try {
      const response = await fetch(`${API_BASE_URL}/materials`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching materials:", error);
      throw error;
    }
  },

  // Add new material to database
  async addMaterial(materialData) {
    try {
      const response = await fetch(`${API_BASE_URL}/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(materialData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error adding material:", error);
      throw error;
    }
  },

  // Update material in database
  async updateMaterial(id, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating material:", error);
      throw error;
    }
  },

  // Remove material from database (mark as taken)
  async removeMaterial(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error removing material:", error);
      throw error;
    }
  },

  // Search materials
  async searchMaterials(searchTerm) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/materials/search/${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error searching materials:", error);
      throw error;
    }
  },

  // Get database health status
  async getHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error checking health:", error);
      throw error;
    }
  },
};

// Action types
const ACTIONS = {
  SET_STORAGE_DATA: "SET_STORAGE_DATA",
  SET_MATERIALS: "SET_MATERIALS",
  ADD_MATERIAL: "ADD_MATERIAL",
  UPDATE_MATERIAL: "UPDATE_MATERIAL",
  REMOVE_MATERIAL: "REMOVE_MATERIAL",
  UPDATE_PALLET: "UPDATE_PALLET",
  CLEAR_PALLET: "CLEAR_PALLET",
  CLEAR_ALL: "CLEAR_ALL",
  SET_SEARCH_TERM: "SET_SEARCH_TERM",
  SET_SEARCH_RESULTS: "SET_SEARCH_RESULTS",
  SET_EDITING_PALLET: "SET_EDITING_PALLET",
  SHOW_TOAST: "SHOW_TOAST",
  HIDE_TOAST: "HIDE_TOAST",
  MOVE_PALLET: "MOVE_PALLET",
  SET_SHOW_STATS_MODAL: "SET_SHOW_STATS_MODAL",
  SET_HIGHLIGHTED_PALLET: "SET_HIGHLIGHTED_PALLET",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
};

// Initial state
const initialState = {
  storageData: {},
  materials: [], // Database materials
  searchTerm: "",
  searchResults: [],
  editingPallet: null,
  toast: { show: false, message: "", type: "info" },
  showStatsModal: false,
  highlightedPallet: null,
  loading: false,
  error: null,
};

// Reducer
function storageReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_STORAGE_DATA:
      return { ...state, storageData: action.payload };

    case ACTIONS.SET_MATERIALS:
      // Convert database materials to storage grid format
      const storageData = {};
      action.payload.forEach((material) => {
        if (material.location) {
          storageData[material.location] = material.material_name;
        }
      });
      return {
        ...state,
        materials: action.payload,
        storageData: storageData,
      };

    case ACTIONS.ADD_MATERIAL:
      return {
        ...state,
        materials: [...state.materials, action.payload],
        storageData: {
          ...state.storageData,
          [action.payload.location]: action.payload.material_name,
        },
      };

    case ACTIONS.UPDATE_MATERIAL:
      const updatedMaterials = state.materials.map((material) =>
        material.id === action.payload.id ? action.payload : material
      );
      const updatedStorageData = { ...state.storageData };
      // Update location mapping
      if (action.payload.location) {
        updatedStorageData[action.payload.location] =
          action.payload.material_name;
      }
      return {
        ...state,
        materials: updatedMaterials,
        storageData: updatedStorageData,
      };

    case ACTIONS.REMOVE_MATERIAL:
      const filteredMaterials = state.materials.filter(
        (material) => material.id !== action.payload.id
      );
      const newStorageData = { ...state.storageData };
      // Remove from storage grid
      Object.keys(newStorageData).forEach((key) => {
        if (newStorageData[key] === action.payload.material_name) {
          delete newStorageData[key];
        }
      });
      return {
        ...state,
        materials: filteredMaterials,
        storageData: newStorageData,
      };

    case ACTIONS.UPDATE_PALLET:
      return {
        ...state,
        storageData: {
          ...state.storageData,
          [action.payload.key]: action.payload.material,
        },
      };

    case ACTIONS.CLEAR_PALLET:
      const clearedData = { ...state.storageData };
      delete clearedData[action.payload];
      return { ...state, storageData: clearedData };

    case ACTIONS.CLEAR_ALL:
      return { ...state, storageData: {}, materials: [] };

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

    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

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

    case ACTIONS.SET_SHOW_STATS_MODAL:
      return { ...state, showStatsModal: action.payload };

    case ACTIONS.SET_HIGHLIGHTED_PALLET:
      return { ...state, highlightedPallet: action.payload };

    default:
      return state;
  }
}

// Provider component
export function StorageProvider({ children }) {
  const [state, dispatch] = useReducer(storageReducer, initialState);

  // Load materials from database on mount
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: ACTIONS.SET_ERROR, payload: null });

        const materials = await apiService.getMaterials();
        dispatch({ type: ACTIONS.SET_MATERIALS, payload: materials });

        console.log(`Loaded ${materials.length} materials from database`);
      } catch (error) {
        console.error("Error loading materials from database:", error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });

        // Fallback to localStorage if database is not available
        try {
          const savedData = localStorage.getItem("storageData");
          if (savedData) {
            dispatch({
              type: ACTIONS.SET_STORAGE_DATA,
              payload: JSON.parse(savedData),
            });
            console.log("Loaded data from localStorage as fallback");
          }
        } catch (localError) {
          console.error("Error loading from localStorage:", localError);
        }
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadMaterials();
  }, []);

  // Backup to localStorage when storage data changes (as fallback)
  useEffect(() => {
    try {
      localStorage.setItem("storageData", JSON.stringify(state.storageData));
    } catch (error) {
      console.error("Error saving backup to localStorage:", error);
    }
  }, [state.storageData]);

  // Actions
  const actions = {
    // Add material to database
    addMaterial: async (materialName, location, quantity = 1) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        const materialData = {
          material_name: materialName,
          location: location,
          quantity: quantity,
        };

        const newMaterial = await apiService.addMaterial(materialData);
        dispatch({ type: ACTIONS.ADD_MATERIAL, payload: newMaterial });

        actions.showToast(
          `Dodano materiał: ${materialName} w lokalizacji ${location}`,
          "success"
        );
        return newMaterial;
      } catch (error) {
        console.error("Error adding material:", error);
        actions.showToast("Błąd podczas dodawania materiału!", "error");
        throw error;
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    },

    // Update material in database
    updateMaterial: async (id, updates) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        const updatedMaterial = await apiService.updateMaterial(id, updates);
        dispatch({ type: ACTIONS.UPDATE_MATERIAL, payload: updatedMaterial });

        actions.showToast("Materiał został zaktualizowany!", "success");
        return updatedMaterial;
      } catch (error) {
        console.error("Error updating material:", error);
        actions.showToast("Błąd podczas aktualizacji materiału!", "error");
        throw error;
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    },

    // Remove material from database
    removeMaterial: async (id) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        const material = state.materials.find((m) => m.id === id);
        await apiService.removeMaterial(id);
        dispatch({
          type: ACTIONS.REMOVE_MATERIAL,
          payload: { id, material_name: material?.material_name },
        });

        actions.showToast("Materiał został usunięty z magazynu!", "success");
      } catch (error) {
        console.error("Error removing material:", error);
        actions.showToast("Błąd podczas usuwania materiału!", "error");
        throw error;
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    },

    updatePallet: async (key, material) => {
      // If adding material to pallet, save to database
      if (material && material.trim()) {
        try {
          await actions.addMaterial(material, key);
        } catch (error) {
          // If database save fails, still update local state
          dispatch({
            type: ACTIONS.UPDATE_PALLET,
            payload: { key, material: material || undefined },
          });
        }
      } else {
        // If clearing pallet, find and remove from database
        const existingMaterial = state.materials.find(
          (m) => m.location === key
        );
        if (existingMaterial) {
          try {
            await actions.removeMaterial(existingMaterial.id);
          } catch (error) {
            // If database removal fails, still update local state
            dispatch({
              type: ACTIONS.UPDATE_PALLET,
              payload: { key, material: undefined },
            });
          }
        } else {
          dispatch({
            type: ACTIONS.UPDATE_PALLET,
            payload: { key, material: undefined },
          });
        }
      }
    },

    clearPallet: async (key) => {
      const existingMaterial = state.materials.find((m) => m.location === key);
      if (existingMaterial) {
        await actions.removeMaterial(existingMaterial.id);
      } else {
        dispatch({ type: ACTIONS.CLEAR_PALLET, payload: key });
      }
    },

    clearAll: () => {
      if (
        window.confirm(
          "Czy na pewno chcesz wyczyścić wszystkie dane magazynowe? Ta akcja nie może zostać cofnięta."
        )
      ) {
        dispatch({ type: ACTIONS.CLEAR_ALL });
        actions.showToast("Wszystkie dane zostały wyczyszczone!", "warning");
      }
    },

    // Reload materials from database
    reloadMaterials: async () => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        const materials = await apiService.getMaterials();
        dispatch({ type: ACTIONS.SET_MATERIALS, payload: materials });
        actions.showToast("Dane zostały odświeżone!", "success");
      } catch (error) {
        console.error("Error reloading materials:", error);
        actions.showToast("Błąd podczas odświeżania danych!", "error");
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    },

    setSearchTerm: (term) => {
      dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: term });
    },

    // Search materials using API
    searchMaterials: async (searchTerm) => {
      try {
        if (!searchTerm.trim()) {
          dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: [] });
          return;
        }

        const results = await apiService.searchMaterials(searchTerm);
        dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: results });
        return results;
      } catch (error) {
        console.error("Error searching materials:", error);
        actions.showToast("Błąd podczas wyszukiwania!", "error");
        return [];
      }
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

    movePallet: async (fromKey, toKey) => {
      // Handle database updates for moving pallets
      const fromMaterial = state.materials.find((m) => m.location === fromKey);
      const toMaterial = state.materials.find((m) => m.location === toKey);

      try {
        if (fromMaterial) {
          if (toMaterial) {
            // Swap materials - update both locations
            await actions.updateMaterial(fromMaterial.id, { location: toKey });
            await actions.updateMaterial(toMaterial.id, { location: fromKey });
          } else {
            // Move to empty location
            await actions.updateMaterial(fromMaterial.id, { location: toKey });
          }
        }

        dispatch({
          type: ACTIONS.MOVE_PALLET,
          payload: { fromKey, toKey },
        });
        actions.showToast("Paleta została przeniesiona!", "success");
      } catch (error) {
        console.error("Error moving pallet:", error);
        actions.showToast("Błąd podczas przenoszenia palety!", "error");
      }
    },

    saveData: async () => {
      // Save to database instead of localStorage
      await actions.reloadMaterials();
    },

    loadData: async () => {
      // Load from database instead of localStorage
      await actions.reloadMaterials();
    },

    exportData: async () => {
      try {
        // Export from database
        const response = await fetch(`${API_BASE_URL}/export`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const exportData = await response.json();
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(dataBlob);
        link.download = `storage_export_${
          new Date().toISOString().split("T")[0]
        }.json`;
        link.click();

        actions.showToast(
          "Dane zostały wyeksportowane z bazy danych!",
          "success"
        );
      } catch (error) {
        console.error("Error exporting data:", error);
        actions.showToast("Błąd podczas eksportowania danych!", "error");
      }
    },

    setShowStatsModal: (show) => {
      dispatch({ type: ACTIONS.SET_SHOW_STATS_MODAL, payload: show });
    },

    setHighlightedPallet: (palletKey) => {
      dispatch({ type: ACTIONS.SET_HIGHLIGHTED_PALLET, payload: palletKey });
    },

    // Get database health status
    checkDatabaseHealth: async () => {
      try {
        const health = await apiService.getHealth();
        console.log("Database health:", health);
        return health;
      } catch (error) {
        console.error("Database health check failed:", error);
        return null;
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
