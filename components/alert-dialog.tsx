"use client"

import { useEffect } from "react"
import { AlertTriangle, XCircle, Info, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { playErrorSound, playWarningSound } from "@/lib/sounds"

interface AlertDialogProps {
  type: "error" | "warning" | "info" | "success"
  title: string
  message: string
  onClose: () => void
}

export default function AlertDialog({ type, title, message, onClose }: AlertDialogProps) {
  useEffect(() => {
    if (type === "error") {
      playErrorSound()
    } else if (type === "warning") {
      playWarningSound()
    }
  }, [type])

  const icons = {
    error: <XCircle className="h-8 w-8 text-destructive" />,
    warning: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
    info: <Info className="h-8 w-8 text-blue-500" />,
    success: <CheckCircle className="h-8 w-8 text-green-500" />,
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div
        className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between p-3 border-b border-border/50 bg-secondary/40 backdrop-blur-sm rounded-t-xl">
          <div className="flex items-center gap-2">
            {icons[type]}
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-secondary/50 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-foreground leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 bg-secondary/20 backdrop-blur-sm border-t border-border/50 rounded-b-xl">
          <Button onClick={onClose} className="min-w-24">
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}
