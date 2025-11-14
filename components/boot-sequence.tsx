"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

type BootStage = "dotlyware" | "boot-menu" | "boot-terminal" | "loading" | "complete"

interface BootSequenceProps {
  onBootComplete: (username: string) => void
}

export default function BootSequence({ onBootComplete }: BootSequenceProps) {
  const [stage, setStage] = useState<BootStage>("dotlyware")
  const [countdown, setCountdown] = useState(5)
  const [terminalInput, setTerminalInput] = useState("")
  const [spinnerRotation, setSpinnerRotation] = useState(0)
  const [spinnerVisible, setSpinnerVisible] = useState(true)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (stage === "dotlyware") {
      const timer = setTimeout(() => {
        setStage("boot-menu")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [stage])

  useEffect(() => {
    if (stage === "boot-menu") {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1)
        }, 1000)
        return () => clearTimeout(timer)
      } else {
        setStage("loading")
      }
    }
  }, [stage, countdown])

  useEffect(() => {
    if (stage === "boot-menu") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setStage("boot-terminal")
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [stage])

  useEffect(() => {
    if (stage === "boot-terminal") {
      const spinInterval = setInterval(() => {
        setSpinnerRotation((prev) => (prev + 90) % 360)
      }, 250)
      
      const blinkInterval = setInterval(() => {
        setSpinnerVisible((prev) => !prev)
      }, 500)
      
      return () => {
        clearInterval(spinInterval)
        clearInterval(blinkInterval)
      }
    }
  }, [stage])

  useEffect(() => {
    if (stage === "boot-terminal") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setStage("loading")
          return
        }

        if (e.key === "Enter") {
          if (terminalInput === "dotly.sign.in/guest") {
            setStage("loading")
            setTimeout(() => {
              onBootComplete("Guest")
            }, 2000)
          } else if (terminalInput === "dis par boot.bin admin = true") {
            localStorage.setItem("dotlyOS_fastboot", "true")
            setTerminalInput("")
            const feedback = document.createElement("div")
            feedback.className = "text-green-400 mt-2"
            feedback.textContent = "✓ Fast boot enabled. Admin mode will boot faster."
            terminalRef.current?.appendChild(feedback)
            setTimeout(() => feedback.remove(), 3000)
            return
          } else {
            setTerminalInput("")
          }
          return
        }

        if (e.key === "Backspace") {
          setTerminalInput((prev) => prev.slice(0, -1))
          return
        }

        if (e.key.length === 1) {
          setTerminalInput((prev) => prev + e.key)
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [stage, terminalInput, onBootComplete])

  useEffect(() => {
    if (stage === "loading") {
      const fastBoot = localStorage.getItem("dotlyOS_fastboot") === "true"
      const bootTime = fastBoot ? 800 : 2000
      
      const timer = setTimeout(() => {
        onBootComplete("Admin")
      }, bootTime)
      return () => clearTimeout(timer)
    }
  }, [stage, onBootComplete])

  if (stage === "dotlyware") {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">dotlyware</h1>
          <div className="w-64 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
        </div>
      </div>
    )
  }

  if (stage === "boot-menu") {
    return (
      <div className="h-screen w-screen bg-black text-white font-mono p-8">
        <div className="space-y-4">
          <div className="text-2xl font-bold mb-8">dotlyOS Boot Manager</div>
          <div className="border border-gray-700 p-4 bg-gray-900">
            <div className="text-green-400">→ dotlyOS (default)</div>
            <div className="text-gray-500 ml-4">Main System Drive</div>
          </div>
          <div className="mt-8 text-sm text-gray-400">
            <div>Press ESC to enter boot terminal</div>
            <div className="mt-2">
              Automatically booting in {countdown} second{countdown !== 1 ? "s" : ""}...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (stage === "boot-terminal") {
    return (
      <div className="h-screen w-screen bg-black text-green-400 font-mono p-8" ref={terminalRef}>
        <div className="space-y-2">
          <div>dotlyOS Boot Terminal v1.0.0</div>
          <div>Type commands to boot into specific accounts</div>
          <div className="text-gray-500">Press ESC to exit and boot normally</div>
          <div className="mt-4 border-t border-gray-800 pt-4">
            <div className="flex items-center">
              <span className="mr-2">boot&gt;</span>
              <span className="caret-transparent">{terminalInput}</span>
              <span 
                className={`ml-1 inline-block text-lg leading-none transition-all duration-150 ${
                  spinnerVisible ? "opacity-100" : "opacity-0"
                }`}
                style={{ transform: `rotate(${spinnerRotation}deg)` }}
              >
                /
              </span>
            </div>
          </div>
          <div className="mt-8 text-xs text-gray-600">
            <div>Available commands:</div>
            <div className="ml-4">dotly.sign.in/guest - Boot into Guest account</div>
            <div className="ml-4">dis par boot.bin admin = true - Enable fast boot for Admin</div>
          </div>
        </div>
      </div>
    )
  }

  if (stage === "loading") {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src="/dotly-logo.png" alt="dotlyOS" width={80} height={80} className="rounded-full" />
            </div>
            <div className="absolute inset-0 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <div className="text-white text-xl font-medium">dotlyOS</div>
          <div className="text-white/70 text-sm mt-2">Loading...</div>
        </div>
      </div>
    )
  }

  return null
}
