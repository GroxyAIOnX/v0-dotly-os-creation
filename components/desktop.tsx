"use client"

import type React from "react"

import { useState } from "react"
import Taskbar from "@/components/taskbar"
import Window from "@/components/window"
import FileManager from "@/components/apps/file-manager"
import Settings from "@/components/apps/settings"
import Notes from "@/components/apps/notes"
import Calculator from "@/components/apps/calculator"
import Terminal from "@/components/apps/terminal"
import Launcher from "@/components/apps/launcher"
import BootManager from "@/components/apps/boot-manager"
import RegistryEditor from "@/components/apps/registry-editor"
import RestartScreen from "@/components/restart-screen"
import AlertDialog from "@/components/alert-dialog"
import {
  FolderOpen,
  SettingsIcon,
  FileText,
  CableIcon as CalcIcon,
  TerminalIcon,
  ImageIcon,
  Grid3x3,
  HardDrive,
  Database,
} from "lucide-react"

interface DesktopProps {
  username: string
}

interface AppWindow {
  id: string
  title: string
  component: React.ReactNode
  icon: React.ReactNode
  isMinimized: boolean
  zIndex: number
}

export default function Desktop({ username }: DesktopProps) {
  const [time, setTime] = useState(new Date())
  const [windows, setWindows] = useState<AppWindow[]>([])
  const [nextZIndex, setNextZIndex] = useState(100)
  const [alert, setAlert] = useState<{
    type: "error" | "warning" | "info" | "success"
    title: string
    message: string
  } | null>(null)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [restartMode, setRestartMode] = useState<"admin" | "normal">("normal")
  const [noteToOpen, setNoteToOpen] = useState<{ name: string; content: string } | null>(null)

  useState(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  })

  const handleAdminAccess = () => {
    setRestartMode("admin")
    setIsRestarting(true)
  }

  const handleRestartComplete = () => {
    setIsRestarting(false)
    if (restartMode === "admin") {
      setIsAdminMode(true)
      setWindows([]) // Close all windows on restart
    }
  }

  const handleOpenNote = (name: string, content: string) => {
    setNoteToOpen({ name, content })
    openApp("notes")
  }

  const apps = [
    {
      id: "launcher",
      name: "Launcher",
      icon: <Grid3x3 className="w-6 h-6" />,
      component: Launcher,
      showInDock: true,
      adminOnly: false,
    },
    {
      id: "files",
      name: "File Manager",
      icon: <FolderOpen className="w-6 h-6" />,
      component: FileManager,
      showInDock: true,
      adminOnly: false,
    },
    {
      id: "terminal",
      name: "Terminal",
      icon: <TerminalIcon className="w-6 h-6" />,
      component: Terminal,
      showInDock: true,
      adminOnly: false,
    },
    {
      id: "notes",
      name: "Notes",
      icon: <FileText className="w-6 h-6" />,
      component: Notes,
      showInDock: true,
      adminOnly: false,
    },
    {
      id: "calculator",
      name: "Calculator",
      icon: <CalcIcon className="w-6 h-6" />,
      component: Calculator,
      showInDock: true,
      adminOnly: false,
    },
    {
      id: "boot-manager",
      name: "Boot Manager",
      icon: <HardDrive className="w-6 h-6" />,
      component: BootManager,
      showInDock: true,
      adminOnly: true,
    },
    {
      id: "registry",
      name: "Registry Editor",
      icon: <Database className="w-6 h-6" />,
      component: RegistryEditor,
      showInDock: true,
      adminOnly: true,
    },
    {
      id: "settings",
      name: "Settings",
      icon: <SettingsIcon className="w-6 h-6" />,
      component: Settings,
      showInDock: false,
      adminOnly: false,
    },
    {
      id: "gallery",
      name: "Gallery",
      icon: <ImageIcon className="w-6 h-6" />,
      component: () => <div className="p-4">Gallery coming soon...</div>,
      showInDock: false,
      adminOnly: false,
    },
  ]

  const openApp = (appId: string) => {
    const existingWindow = windows.find((w) => w.id === appId)
    if (existingWindow) {
      bringToFront(appId)
      setWindows((prev) => prev.map((w) => (w.id === appId ? { ...w, isMinimized: false } : w)))
      return
    }

    const app = apps.find((a) => a.id === appId)
    if (!app) return

    const AppComponent = app.component
    let component: React.ReactNode
    if (appId === "terminal") {
      component = <AppComponent onAdminAccess={handleAdminAccess} />
    } else if (appId === "launcher") {
      component = <AppComponent apps={apps} onAppOpen={openApp} isAdminMode={isAdminMode} />
    } else if (appId === "files") {
      component = <AppComponent isAdminMode={isAdminMode} onOpenNote={handleOpenNote} />
    } else if (appId === "notes" && noteToOpen) {
      component = <AppComponent initialNote={noteToOpen} />
      setNoteToOpen(null) // Clear after opening
    } else {
      component = <AppComponent />
    }

    const newWindow: AppWindow = {
      id: appId,
      title: app.name,
      component,
      icon: app.icon,
      isMinimized: false,
      zIndex: nextZIndex,
    }

    setWindows((prev) => [...prev, newWindow])
    setNextZIndex((prev) => prev + 1)
  }

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }

  const minimizeWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)))
  }

  const bringToFront = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex } : w)))
    setNextZIndex((prev) => prev + 1)
  }

  const toggleMinimize = (id: string) => {
    const window = windows.find((w) => w.id === id)
    if (window?.isMinimized) {
      bringToFront(id)
    }
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: !w.isMinimized } : w)))
  }

  if (isRestarting) {
    return <RestartScreen onComplete={handleRestartComplete} mode={restartMode} />
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 relative">
      {isAdminMode && (
        <div className="absolute top-4 right-4 z-50 bg-destructive/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-destructive shadow-lg">
          ADMIN MODE
        </div>
      )}

      {/* Windows */}
      {windows.map(
        (window) =>
          !window.isMinimized && (
            <Window
              key={window.id}
              title={window.title}
              icon={window.icon}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onFocus={() => bringToFront(window.id)}
              zIndex={window.zIndex}
            >
              {window.component}
            </Window>
          ),
      )}

      {/* Taskbar */}
      <Taskbar
        username={username}
        time={time}
        windows={windows.map((w) => ({
          id: w.id,
          title: w.title,
          icon: w.icon,
          isMinimized: w.isMinimized,
        }))}
        dockApps={apps
          .filter((app) => app.showInDock && (!app.adminOnly || isAdminMode))
          .map((app) => ({ id: app.id, name: app.name, icon: app.icon }))}
        onWindowClick={toggleMinimize}
        onAppOpen={openApp}
        isAdminMode={isAdminMode}
      />

      {/* Windows-style alert dialog overlay */}
      {alert && (
        <AlertDialog type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert(null)} />
      )}
    </div>
  )
}
