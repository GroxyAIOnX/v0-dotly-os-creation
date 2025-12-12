"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"

interface LockScreenTerminalProps {
  onClose: () => void
}

export default function LockScreenTerminal({ onClose }: LockScreenTerminalProps) {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<Array<{ input: string; output: string[] }>>([
    {
      input: "",
      output: [
        "dotlyOS Lock Screen Terminal v1.0",
        'Type "log" to view console logs',
        'Type "help" for available commands',
        "",
      ],
    },
  ])
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [consoleHistory, setConsoleHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    const logs: string[] = []

    console.log = (...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")
      logs.push(`[LOG] ${message}`)
      setConsoleHistory((prev) => [...prev, `[LOG] ${message}`])
      originalLog.apply(console, args)
    }

    console.error = (...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")
      logs.push(`[ERROR] ${message}`)
      setConsoleHistory((prev) => [...prev, `[ERROR] ${message}`])
      originalError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")
      logs.push(`[WARN] ${message}`)
      setConsoleHistory((prev) => [...prev, `[WARN] ${message}`])
      originalWarn.apply(console, args)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [history])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".terminal-header")) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const cmd = input.trim().toLowerCase()
    let output: string[] = []

    switch (cmd) {
      case "help":
        output = [
          "Available commands:",
          "  log     - Display browser console logs",
          "  clear   - Clear terminal screen",
          "  help    - Show this help message",
          "  exit    - Close terminal",
          "",
        ]
        break
      case "log":
        if (consoleHistory.length === 0) {
          output = ["No console logs captured yet.", ""]
        } else {
          output = ["=== Console Logs ===", ...consoleHistory, "=== End of Logs ===", ""]
        }
        break
      case "clear":
        setHistory([{ input: "", output: [] }])
        setInput("")
        return
      case "exit":
        onClose()
        return
      default:
        output = [`Unknown command: ${input}`, 'Type "help" for available commands', ""]
    }

    setHistory((prev) => [...prev, { input, output }])
    setInput("")
  }

  return (
    <div
      ref={terminalRef}
      className="fixed z-50 bg-black/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "600px",
        maxHeight: "400px",
        cursor: isDragging ? "grabbing" : "default",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Terminal Header */}
      <div className="terminal-header flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 cursor-grab active:cursor-grabbing">
        <span className="text-white/80 text-sm font-mono">Lock Screen Terminal</span>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white hover:bg-white/10 rounded p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Terminal Content */}
      <div className="p-4 overflow-y-auto max-h-[320px] font-mono text-sm">
        {history.map((entry, i) => (
          <div key={i}>
            {entry.input && (
              <div className="text-green-400">
                <span className="text-purple-400">guest@dotlyOS</span>
                <span className="text-white">:</span>
                <span className="text-blue-400">~</span>
                <span className="text-white">$ </span>
                <span>{entry.input}</span>
              </div>
            )}
            {entry.output.map((line, j) => (
              <div key={j} className="text-white/80 whitespace-pre-wrap break-all">
                {line}
              </div>
            ))}
          </div>
        ))}

        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-purple-400">guest@dotlyOS</span>
          <span className="text-white">:</span>
          <span className="text-blue-400">~</span>
          <span className="text-white">$ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white ml-1 font-mono"
            autoFocus
          />
        </form>
      </div>
    </div>
  )
}
