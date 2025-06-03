import React from "react";
import {
  Save,
  FolderOpen,
  Trash2,
  Download,
  Factory,
  BarChart3,
} from "lucide-react";
import { useStorage } from "../context/StorageContext";
import "./Header.css";

function Header() {
  const { actions } = useStorage();

  return (
    <header className="header">
      <div className="header-title">
        <Factory size={24} />
        <h1>System Zarządzania Magazynem</h1>
      </div>

      <div className="header-controls">
        <button
          className="btn btn-info"
          onClick={() => actions.setShowStatsModal(true)}
          title="Wyświetl statystyki"
        >
          <BarChart3 size={16} />
          Statystyki
        </button>

        <button
          className="btn btn-primary"
          onClick={actions.saveData}
          title="Zapisz dane"
        >
          <Save size={16} />
          Zapisz
        </button>

        <button
          className="btn btn-secondary"
          onClick={actions.loadData}
          title="Wczytaj dane"
        >
          <FolderOpen size={16} />
          Wczytaj
        </button>

        <button
          className="btn btn-danger"
          onClick={actions.clearAll}
          title="Wyczyść wszystkie dane"
        >
          <Trash2 size={16} />
          Wyczyść
        </button>

        <button
          className="btn btn-success"
          onClick={actions.exportData}
          title="Eksportuj dane"
        >
          <Download size={16} />
          Eksportuj
        </button>
      </div>
    </header>
  );
}

export default Header;
