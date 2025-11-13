import * as React from "react"

export interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning'
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    setToasts((prev) => [...prev, props])
    setTimeout(() => {
      setToasts((prev) => prev.slice(1))
    }, 3000)
  }, [])

  return { toast, toasts }
}

export function Toaster({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t, i) => (
        <div
          key={i}
          className={`p-4 rounded-lg shadow-lg animate-slide-in ${
            t.variant === 'success' ? 'bg-green-600 text-white' :
            t.variant === 'error' ? 'bg-red-600 text-white' :
            t.variant === 'warning' ? 'bg-yellow-600 text-white' :
            'bg-gray-900 text-white'
          }`}
        >
          {t.title && <div className="font-semibold">{t.title}</div>}
          {t.description && <div className="text-sm opacity-90">{t.description}</div>}
        </div>
      ))}
    </div>
  )
}
