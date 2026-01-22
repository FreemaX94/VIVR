'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'
import { useToastStore, ToastType } from '@/stores/toastStore'
import { cn } from '@/lib/utils'

const icons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

const iconStyles: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
}

function Toast({
  id,
  type,
  message,
  onRemove
}: {
  id: string
  type: ToastType
  message: string
  onRemove: (id: string) => void
}) {
  const [isExiting, setIsExiting] = useState(false)
  const Icon = icons[type]

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(id), 200)
  }

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-200',
        styles[type],
        isExiting
          ? 'opacity-0 translate-y-[-20px] scale-95'
          : 'opacity-100 translate-y-0 scale-100 animate-toast-in'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconStyles[type])} aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Fermer la notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onRemove={removeToast}
        />
      ))}
    </div>
  )
}
