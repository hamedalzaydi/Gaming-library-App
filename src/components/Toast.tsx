import React from 'react'
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react'
import { Toast as ToastType } from '../contexts/GameContext'

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-600',
    textColor: 'text-green-100',
    borderColor: 'border-green-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-600',
    textColor: 'text-blue-100',
    borderColor: 'border-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-600',
    textColor: 'text-yellow-100',
    borderColor: 'border-yellow-500',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-600',
    textColor: 'text-red-100',
    borderColor: 'border-red-500',
  },
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const config = toastConfig[toast.type]
  const Icon = config.icon

  return (
    <div
      className={`${config.bgColor} ${config.textColor} border ${config.borderColor} rounded-lg shadow-lg p-4 max-w-sm w-full transform transition-all duration-300 ease-in-out animate-slide-in`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5">{toast.message}</p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/20 transition-colors duration-200"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast Container component to manage multiple toasts
export function ToastContainer({ toasts, onRemove }: { toasts: ToastType[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
