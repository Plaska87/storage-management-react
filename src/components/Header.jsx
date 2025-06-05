import React from "react";
import { Factory, BarChart3 } from "lucide-react";
import { useStorage } from "../context/StorageContext";
import logo from "../assets/aib-logo.png";
import "./Header.css";

function Header() {
  const { actions } = useStorage();

  return (
    <header className="header">
      <div className="header-title">
        <img src={logo} alt="AIB Logo" className="header-logo" />
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
      </div>
    </header>
  );
}

export default Header;
