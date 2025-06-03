import React from "react";
import { StorageProvider } from "./context/StorageContext";
import Header from "./components/Header";
import SearchPanel from "./components/SearchPanel";
import StatsPanel from "./components/StatsPanel";
import StorageGrid from "./components/StorageGrid";
import EditModal from "./components/EditModal";
import Toast from "./components/Toast";
import "./App.css";

function App() {
  return (
    <StorageProvider>
      <div className="app">
        <Header />
        <SearchPanel />
        <StatsPanel />
        <StorageGrid />
        <EditModal />
        <Toast />
      </div>
    </StorageProvider>
  );
}

export default App;
