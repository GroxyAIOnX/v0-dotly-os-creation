"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

type BootStage = "dotlyware" | "boot-menu" | "boot-terminal" | "loading" | "complete"

interface BootSequenceProps {
  onBootComplete: (username: string) => void
}

const bootOptions = [
  { label: "dotlyOS (default)", description: "Main System Drive", action: "normal" },
  { label: "dotlyOS Safe Mode", description: "Minimal drivers and services", action: "safe" },
  { label: "Boot Terminal", description: "Command line interface", action: "terminal" },
]

export default function BootSequence({ onBootComplete }: BootSequenceProps) {
  const [stage, setStage] = useState<BootStage>("dotlyware")
  const [countdown, setCountdown] = useState(5)
  const [terminalInput, setTerminalInput] = useState("")
  const [spinnerRotation, setSpinnerRotation] = useState(0)
  const [spinnerVisible, setSpinnerVisible] = useState(true)
  const [selectedOption, setSelectedOption] = useState(0)
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
        if (e.key === "ArrowUp") {
          e.preventDefault()
          setSelectedOption((prev) => (prev > 0 ? prev - 1 : bootOptions.length - 1))
          setCountdown(5) // Reset countdown on interaction
        } else if (e.key === "ArrowDown") {
          e.preventDefault()
          setSelectedOption((prev) => (prev < bootOptions.length - 1 ? prev + 1 : 0))
          setCountdown(5) // Reset countdown on interaction
        } else if (e.key === "Enter") {
          e.preventDefault()
          const selected = bootOptions[selectedOption]
          if (selected.action === "terminal") {
            setStage("boot-terminal")
          } else {
            setStage("loading")
          }
        } else if (e.key === "Escape") {
          setStage("boot-terminal")
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [stage, selectedOption])

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
          <h1 className="text-7xl font-[family-name:var(--font-pixel)] text-white mb-8 tracking-wider">dotlyOS</h1>
          <div className="flex justify-center gap-2 mb-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-3 h-3 bg-white animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <div className="text-white/60 text-xs font-[family-name:var(--font-pixel)] mt-4">Starting up...</div>
        </div>
      </div>
    )
  }

  if (stage === "boot-menu") {
    return (
      <div className="h-screen w-screen bg-black text-white font-[family-name:var(--font-pixel)] p-8">
        <div className="max-w-4xl">
          <div className="text-xs mb-8 border-2 border-gray-500 bg-gray-900 p-4">
            <div className="text-center mb-4 text-lg">dotlyOS Boot Menu</div>
            <div className="text-[10px] text-gray-400 text-center">Version 1.0.0</div>
          </div>

          <div className="space-y-1 mb-6">
            {bootOptions.map((option, index) => (
              <div
                key={index}
                className={`p-3 transition-colors text-xs ${
                  selectedOption === index ? "bg-blue-600 text-white" : "bg-black text-gray-300"
                }`}
              >
                <div className="flex items-center">
                  {selectedOption === index && <span className="mr-2">►</span>}
                  <span>{option.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-gray-700 pt-4 text-[10px] text-gray-400 space-y-1">
            <div>Use ↑ and ↓ to move the highlight to your choice.</div>
            <div>Press ENTER to choose.</div>
            <div>Press ESC to enter Boot Terminal.</div>
            <div className="mt-3 text-white">
              Seconds until highlighted choice will be started automatically: {countdown}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (stage === "boot-terminal") {
    return (
      <div
        className="h-screen w-screen bg-black text-green-400 font-[family-name:var(--font-pixel)] p-8"
        ref={terminalRef}
      >
        <div className="space-y-2 text-xs">
          <div>dotlyOS Boot Terminal v1.0.0</div>
          <div className="text-[10px]">Type commands to boot into specific accounts</div>
          <div className="text-gray-500 text-[10px]">Press ESC to exit and boot normally</div>
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
          <div className="mt-8 text-[10px] text-gray-600">
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
          <div className="text-white text-sm font-[family-name:var(--font-pixel)]">dotlyOS</div>
          <div className="text-white/70 text-xs font-[family-name:var(--font-pixel)] mt-2">Loading...</div>
        </div>
      </div>
    )
  }

  return null
}
