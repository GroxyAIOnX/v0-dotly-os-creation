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
  const [currentDir, setCurrentDir] = useState("~")
  const [bootManagerMode, setBootManagerMode] = useState(false)
  const [partitions, setPartitions] = useState<string[]>(["MAIN_DRIVE", "SYSTEM_RESERVED"])
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = (command: string) => {
    const cmd = command.trim().toLowerCase()
    const args = command.trim().split(" ")
    let output = ""
    let type: "info" | "error" | "success" = "info"

    // Boot Manager Mode Commands
    if (bootManagerMode) {
      switch (cmd) {
        case "sh":
          output = "Shutting down dotlyOS..."
          type = "success"
          setHistory((prev) => [...prev, { input: command, output, type }])
          setTimeout(() => {
            window.location.reload()
          }, 1500)
          return

        case "re":
          output = "Restarting dotlyOS..."
          type = "success"
          setHistory((prev) => [...prev, { input: command, output, type }])
          setTimeout(() => {
            window.location.reload()
          }, 1500)
          return

        case "l":
          output = "Locking system..."
          type = "success"
          setHistory((prev) => [...prev, { input: command, output, type }])
          setTimeout(() => {
            window.location.reload()
          }, 1500)
          return

        case "bi":
          output =
            "Entering BIOS...\n\ndotlyOS BIOS Setup Utility - Version 1.0.0\n\nBIOS Information:\n  Vendor: dotlyware\n  Version: 1.0.0\n  Release Date: 12/17/2024\n\nSystem Information:\n  Product Name: dotlyOS Workstation\n  Boot Priority: MAIN_DRIVE\n  Secure Boot: Enabled\n\n[Press ESC to return to Boot Manager]"
          type = "info"
          break

        case "exit":
          setBootManagerMode(false)
          output = "Exited Boot Manager mode."
          type = "info"
          break

        default:
          output = `Unknown Boot Manager command: ${command}\nAvailable: sh (shutdown), re (restart), l (lock), bi (BIOS), exit`
          type = "error"
          playErrorSound()
          break
      }

      setHistory((prev) => [...prev, { input: `bootman> ${command}`, output, type }])
      setCurrentInput("")
      return
    }

    // Normal Terminal Commands
    switch (args[0]) {
      case "help":
        output = `Available commands:
  help              - Show this help message
  clear             - Clear terminal screen
  date              - Show current date and time
  whoami            - Display current user
  cd <path>         - Change directory
  ls                - List directories and files
  dis               - Display disk information
  par               - Show partition information
  crp <name>        - Create a new partition
  bootman re        - Enter Boot Manager (re to access)
  admin.access      - Enter admin mode (requires restart)
  
File System Commands:
  cd /              - Go to root directory
  cd ~              - Go to home directory
  cd ..             - Go to parent directory
  ls                - List current directory contents
  
Disk Commands:
  dis               - Show all disks
  par               - Show all partitions
  crp <name>        - Create partition (e.g., crp DATA_DRIVE)`
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

      case "cd":
        if (args.length < 2) {
          output = "Usage: cd <directory>"
          type = "error"
        } else {
          const newDir = args[1]
          if (newDir === "/") {
            setCurrentDir("/")
            output = "Changed to root directory"
            type = "success"
          } else if (newDir === "~") {
            setCurrentDir("~")
            output = "Changed to home directory"
            type = "success"
          } else if (newDir === "..") {
            if (currentDir !== "/") {
              const parts = currentDir.split("/").filter(Boolean)
              parts.pop()
              setCurrentDir(parts.length ? "/" + parts.join("/") : "/")
              output = "Changed to parent directory"
              type = "success"
            } else {
              output = "Already at root directory"
              type = "info"
            }
          } else {
            setCurrentDir(currentDir === "/" ? "/" + newDir : currentDir + "/" + newDir)
            output = `Changed directory to: ${currentDir === "/" ? "/" + newDir : currentDir + "/" + newDir}`
            type = "success"
          }
        }
        break

      case "ls":
        if (currentDir === "~") {
          output = `Documents/
Desktop/
Downloads/
Pictures/
.config/
.dotly/`
        } else if (currentDir === "/") {
          output = `home/
systems/
bin/
boot/
dev/
etc/
usr/
var/`
        } else if (currentDir.includes("systems")) {
          output = `system.d/
drivers/
modules/
firmware/`
        } else {
          output = `File1.txt
File2.txt
Folder1/`
        }
        break

      case "dis":
        output = `Disk Information:

DISK 0 (MAIN_DRIVE)
  Size: 512 GB
  Type: SSD
  Status: Healthy
  Partitions: 2
  
DISK 1 (SYSTEM_RESERVED)
  Size: 100 MB
  Type: System
  Status: Active
  Partitions: 1`
        break

      case "par":
        output = `Partition Information:\n\n${partitions.map((p, i) => `  ${i + 1}. ${p} (Active)`).join("\n")}`
        break

      case "crp":
        if (args.length < 2) {
          output = "Usage: crp <partition_name>"
          type = "error"
        } else {
          const newPartition = args[1].toUpperCase()
          if (partitions.includes(newPartition)) {
            output = `Partition ${newPartition} already exists!`
            type = "error"
            playErrorSound()
          } else {
            setPartitions((prev) => [...prev, newPartition])
            output = `✓ Successfully created partition: ${newPartition}\nPartition is ready for use on dotlyOS MAIN_DRIVE.`
            type = "success"
          }
        }
        break

      case "bootman":
        if (args[1] === "re") {
          setBootManagerMode(true)
          output = `Entering Boot Manager mode...

dotlyOS Boot Manager v1.0.0

Available commands:
  sh  - Shutdown system
  re  - Restart system
  l   - Lock system
  bi  - Enter BIOS
  exit - Exit Boot Manager

Type a command to continue:`
          type = "success"
        } else {
          output = "Usage: bootman re (to enter Boot Manager mode)"
          type = "error"
        }
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

  const getPrompt = () => {
    if (bootManagerMode) {
      return <span className="text-red-400">bootman&gt;</span>
    }
    return (
      <>
        <span className="text-blue-400">guest@dotlyOS</span>
        <span className="text-white">:</span>
        <span className="text-green-400">{currentDir}</span>
        <span className="text-white">$</span>
      </>
    )
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
                {entry.input.startsWith("bootman>") ? (
                  <>
                    <span className="text-red-400">bootman&gt;</span>
                    <span className="text-white">{entry.input.replace("bootman> ", "")}</span>
                  </>
                ) : (
                  <>
                    <span className="text-blue-400">guest@dotlyOS</span>
                    <span className="text-white">:</span>
                    <span className="text-green-400">~</span>
                    <span className="text-white">$</span>
                    <span className="text-white ml-2">{entry.input}</span>
                  </>
                )}
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
        {getPrompt()}
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-white ml-2"
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  )
}
