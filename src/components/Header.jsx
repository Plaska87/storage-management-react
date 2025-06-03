import React from 'react'
import { Save, FolderOpen, Trash2, Download, Factory } from 'lucide-react'
import { useStorage } from '../context/StorageContext'
import './Header.css'

function Header() {
  const { actions } = useStorage()

  return (
    <header className="header">
      <div className="header-title">
        <Factory size={24} />
        <h1>Storage Management System</h1>
      </div>
      
      <div className="header-controls">
        <button 
          className="btn btn-primary"
          onClick={actions.saveData}
          title="Save Data"
        >
          <Save size={16} />
          Save Data
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={actions.loadData}
          title="Load Data"
        >
          <FolderOpen size={16} />
          Load Data
        </button>
        
        <button 
          className="btn btn-danger"
          onClick={actions.clearAll}
          title="Clear All Data"
        >
          <Trash2 size={16} />
          Clear All
        </button>
        
        <button 
          className="btn btn-success"
          onClick={actions.exportData}
          title="Export Data"
        >
          <Download size={16} />
          Export
        </button>
      </div>
    </header>
  )
}

export default Header
