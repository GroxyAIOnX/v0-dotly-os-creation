"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { playErrorSound } from "@/lib/sounds"

interface TerminalProps {
  onAdminAccess: () => void
}

export default function Terminal({ onAdminAccess }: TerminalProps) {
  const [history, setHistory] = useState<Array<{ input: string; output: string; type: "info" | "error" | "success" }>>([
    {
      input: "",
      output: "dotlyOS Terminal v1.0.0\nType 'help' for available commands.",
      type: "info",
    },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = (command: string) => {
    const cmd = command.trim().toLowerCase()
    let output = ""
    let type: "info" | "error" | "success" = "info"

    switch (cmd) {
      case "help":
        output = `Available commands:
  help       - Show this help message
  clear      - Clear terminal screen
  date       - Show current date and time
  whoami     - Display current user
  admin.access - Enter admin mode (requires system restart)`
        break

      case "clear":
        setHistory([])
        setCurrentInput("")
        return

      case "date":
        output = new Date().toString()
        break

      case "whoami":
        output = "guest"
        break

      case "admin.access":
        output = "Initiating admin mode...\nRestarting dotlyOS with elevated privileges..."
        type = "success"
        setHistory((prev) => [...prev, { input: command, output, type }])

        setTimeout(() => {
          onAdminAccess()
        }, 1500)
        return

      case "":
        setCurrentInput("")
        return

      default:
        output = `Command not found: ${command}\nType 'help' for available commands.`
        type = "error"
        playErrorSound()
        break
    }

    setHistory((prev) => [...prev, { input: command, output, type }])
    setCurrentInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(currentInput)
    }
  }

  return (
    <div
      className="h-full bg-black/95 text-green-400 font-mono text-sm p-4 flex flex-col cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={terminalRef} className="flex-1 overflow-y-auto space-y-2 mb-2">
        {history.map((entry, index) => (
          <div key={index}>
            {entry.input && (
              <div className="flex gap-2">
                <span className="text-blue-400">guest@dotlyOS:~$</span>
                <span className="text-white">{entry.input}</span>
              </div>
            )}
            {entry.output && (
              <pre
                className={`whitespace-pre-wrap ${
                  entry.type === "error"
                    ? "text-red-400"
                    : entry.type === "success"
                      ? "text-green-400"
                      : "text-gray-300"
                }`}
              >
                {entry.output}
              </pre>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-blue-400">guest@dotlyOS:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-white"
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  )
}
