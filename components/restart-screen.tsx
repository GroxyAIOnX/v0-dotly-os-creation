"use client"

import { useEffect, useState } from "react"

interface RestartScreenProps {
  onComplete: () => void
  mode: "admin" | "normal"
}

export default function RestartScreen({ onComplete, mode }: RestartScreenProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    const completeTimeout = setTimeout(() => {
      onComplete()
    }, 3000)

    return () => {
      clearInterval(dotInterval)
      clearTimeout(completeTimeout)
    }
  }, [onComplete])

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
      {/* Loading Spinner */}
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
      </div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-white">
          {mode === "admin" ? "Entering Admin Mode" : "Restarting dotlyOS"}
          {dots}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "admin" ? "Granting elevated privileges" : "Please wait"}
        </p>
      </div>

      {/* dotlyOS Logo */}
      <div className="absolute bottom-12">
        <p className="text-accent font-semibold text-sm">dotlyOS</p>
      </div>
    </div>
  )
}
