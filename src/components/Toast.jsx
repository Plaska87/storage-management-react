import React, { useEffect } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useStorage } from '../context/StorageContext'
import './Toast.css'

function Toast() {
  const { state, actions } = useStorage()
  const { toast } = state

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        actions.hideToast()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [toast.show, actions])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <AlertCircle size={20} />
      case 'warning':
        return <AlertTriangle size={20} />
      default:
        return <Info size={20} />
    }
  }

  const handleClose = () => {
    actions.hideToast()
  }

  if (!toast.show) return null

  return (
    <div className={`toast toast-${toast.type} ${toast.show ? 'show' : ''}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon()}
        </div>
        <div className="toast-message">
          {toast.message}
        </div>
        <button 
          className="toast-close"
          onClick={handleClose}
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default Toast
