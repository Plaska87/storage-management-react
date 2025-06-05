import React from "react";
import { StorageProvider } from "./context/StorageContext";
import Header from "./components/Header";
import SearchPanel from "./components/SearchPanel";
import RackTabs from "./components/RackTabs";
import StorageGrid from "./components/StorageGrid";
import EditModal from "./components/EditModal";
import StatsModal from "./components/StatsModal";
import Toast from "./components/Toast";
import "./App.css";

function App() {
  return (
    <StorageProvider>
      <div className="app">
        <Header />
        <SearchPanel />
        <RackTabs />
        <StorageGrid />
        <EditModal />
        <StatsModal />
        <Toast />
      </div>
    </StorageProvider>
  );
}

export default App;
