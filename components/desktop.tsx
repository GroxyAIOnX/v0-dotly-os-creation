"use client"

import type React from "react"

import { useState, useEffect } from "react"

console.log("[v0] Desktop component loading...")

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
import ImportHtml from "@/components/apps/import-html"
import RestartScreen from "@/components/restart-screen"
import AlertDialog from "@/components/alert-dialog"
import DrxInstaller from "@/components/apps/drx-installer"
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
  FileCode,
  RefreshCw,
  LogOut,
  Package,
} from "lucide-react"
import { getAccount, saveAccount } from "@/lib/storage"

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
  console.log("[v0] Desktop rendering with username:", username)

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
  const [drxInstallerData, setDrxInstallerData] = useState<{ name: string; html: string } | null>(null)
  const [desktopContextMenu, setDesktopContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [installedDrxApps, setInstalledDrxApps] = useState<Array<{ id: string; name: string; html: string }>>([])

  console.log("[v0] State initialized")

  useEffect(() => {
    console.log("[v0] Setting up time interval")
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    console.log("[v0] Loading installed .drx apps for username:", username)
    if (username) {
      try {
        const account = getAccount(username)
        console.log("[v0] Account data:", account)
        if (account?.drxApps) {
          console.log("[v0] Found drx apps:", account.drxApps.length)
          setInstalledDrxApps(account.drxApps)
        }
      } catch (error) {
        console.error("[v0] Error loading drx apps:", error)
      }
    }
  }, [username])

  const handleAdminAccess = () => {
    console.log("[v0] Admin access requested")
    setRestartMode("admin")
    setIsRestarting(true)
  }

  const handleRestartComplete = () => {
    console.log("[v0] Restart complete, mode:", restartMode)
    setIsRestarting(false)
    if (restartMode === "admin") {
      setIsAdminMode(true)
      setWindows([]) // Close all windows on restart
    }
  }

  const handleOpenNote = (name: string, content: string) => {
    console.log("[v0] Opening note:", name)
    setNoteToOpen({ name, content })
    openApp("notes")
  }

  const showAlert = (alertData: { type: "error" | "warning" | "info" | "success"; title: string; message: string }) => {
    console.log("[v0] Showing alert:", alertData)
    setAlert(alertData)
  }

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("[v0] Desktop context menu opened")
    setDesktopContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleCloseDesktopMenu = () => {
    setDesktopContextMenu(null)
  }

  const handleRefresh = () => {
    console.log("[v0] Refreshing desktop")
    setRestartMode("normal")
    setIsRestarting(true)
    setDesktopContextMenu(null)
  }

  const handleLogout = () => {
    console.log("[v0] Logging out")
    window.location.reload()
  }

  const handleOpenDrxInstaller = (name: string, html: string) => {
    console.log("[v0] Opening DRX installer for:", name)
    setDrxInstallerData({ name, html })
    openApp("drx-installer")
  }

  const handleDrxInstallComplete = (installed: boolean) => {
    console.log("[v0] DRX install complete, installed:", installed)
    if (installed && drxInstallerData && username) {
      try {
        const account = getAccount(username)
        if (account) {
          const newApp = {
            id: Date.now().toString(),
            name: drxInstallerData.name,
            html: drxInstallerData.html,
            installedAt: new Date().toISOString(),
          }

          if (!account.drxApps) account.drxApps = []
          if (!account.savedHtmlApps) account.savedHtmlApps = []

          account.drxApps.push(newApp)
          account.savedHtmlApps.push(newApp)
          saveAccount(account)

          console.log("[v0] App installed successfully")
          setInstalledDrxApps([...account.drxApps])
        }
      } catch (error) {
        console.error("[v0] Error installing drx app:", error)
      }
    }
    setDrxInstallerData(null)
    closeWindow("drx-installer")
  }

  useEffect(() => {
    if (desktopContextMenu) {
      document.addEventListener("click", handleCloseDesktopMenu)
      return () => {
        document.removeEventListener("click", handleCloseDesktopMenu)
      }
    }
  }, [desktopContextMenu])

  console.log("[v0] Creating apps list")

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
      id: "import-html",
      name: "Import HTML",
      icon: <FileCode className="w-6 h-6" />,
      component: ImportHtml,
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
    {
      id: "drx-installer",
      name: "Application Installer",
      icon: <Package className="w-6 h-6" />,
      component: DrxInstaller,
      showInDock: false,
      adminOnly: false,
    },
  ]

  console.log("[v0] Creating allApps with", installedDrxApps.length, "drx apps")

  const allApps = [
    ...apps,
    // Add installed .drx apps dynamically
    ...installedDrxApps.map((drxApp) => ({
      id: `drx-${drxApp.id}`,
      name: drxApp.name,
      icon: <Package className="w-6 h-6 text-primary" />,
      component: () => (
        <div className="h-full w-full">
          <iframe
            srcDoc={drxApp.html}
            className="w-full h-full border-0"
            title={drxApp.name}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      ),
      showInDock: true,
      adminOnly: false,
      isDrxApp: true,
    })),
  ]

  const openApp = (appId: string) => {
    console.log("[v0] Opening app:", appId)

    const existingWindow = windows.find((w) => w.id === appId)
    if (existingWindow) {
      console.log("[v0] Window already exists, bringing to front")
      bringToFront(appId)
      setWindows((prev) => prev.map((w) => (w.id === appId ? { ...w, isMinimized: false } : w)))
      return
    }

    const app = allApps.find((a) => a.id === appId)
    if (!app) {
      console.error("[v0] App not found:", appId)
      return
    }

    console.log("[v0] Creating new window for:", app.name)

    if (appId === "drx-installer" && !drxInstallerData) {
      console.log("[v0] Cannot open drx-installer without installation data")
      return
    }

    const AppComponent = app.component
    let component: React.ReactNode

    try {
      if (appId === "terminal") {
        console.log("[v0] Creating terminal component with admin access handler")
        component = <AppComponent onAdminAccess={handleAdminAccess} />
      } else if (appId === "launcher") {
        console.log("[v0] Creating launcher component")
        component = <AppComponent apps={allApps} onAppOpen={openApp} isAdminMode={isAdminMode} />
      } else if (appId === "files") {
        console.log("[v0] Creating file manager component")
        component = <AppComponent isAdminMode={isAdminMode} onOpenNote={handleOpenNote} />
      } else if (appId === "notes" && noteToOpen) {
        console.log("[v0] Creating notes component with initial note")
        component = <AppComponent initialNote={noteToOpen} />
        setNoteToOpen(null) // Clear after opening
      } else if (appId === "settings") {
        console.log("[v0] Creating settings component")
        component = <AppComponent username={username} onShowAlert={showAlert} />
      } else if (appId === "import-html") {
        console.log("[v0] Creating import-html component")
        component = <AppComponent username={username} onOpenDrxInstaller={handleOpenDrxInstaller} />
      } else if (appId === "drx-installer" && drxInstallerData) {
        console.log("[v0] Creating drx-installer component")
        component = (
          <AppComponent
            appName={drxInstallerData.name}
            appHtml={drxInstallerData.html}
            onInstall={handleDrxInstallComplete}
            onClose={() => closeWindow("drx-installer")}
          />
        )
      } else {
        console.log("[v0] Creating default component")
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

      console.log("[v0] Adding window to state")
      setWindows((prev) => [...prev, newWindow])
      setNextZIndex((prev) => prev + 1)
    } catch (error) {
      console.error("[v0] Error creating window component:", error)
    }
  }

  const closeWindow = (id: string) => {
    console.log("[v0] Closing window:", id)
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }

  const minimizeWindow = (id: string) => {
    console.log("[v0] Minimizing window:", id)
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)))
  }

  const bringToFront = (id: string) => {
    console.log("[v0] Bringing window to front:", id)
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex } : w)))
    setNextZIndex((prev) => prev + 1)
  }

  const toggleMinimize = (id: string) => {
    console.log("[v0] Toggling minimize for window:", id)
    const window = windows.find((w) => w.id === id)
    if (window?.isMinimized) {
      bringToFront(id)
    }
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: !w.isMinimized } : w)))
  }

  if (isRestarting) {
    console.log("[v0] Showing restart screen")
    return <RestartScreen onComplete={handleRestartComplete} mode={restartMode} />
  }

  console.log("[v0] Rendering desktop with", windows.length, "windows")

  return (
    <div
      className="h-full w-full bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 relative"
      onContextMenu={handleDesktopContextMenu}
    >
      {isAdminMode && (
        <div className="absolute top-4 right-4 z-50 bg-destructive/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-destructive shadow-lg">
          ADMIN MODE
        </div>
      )}

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
              isMinimized={window.isMinimized}
            >
              {window.component}
            </Window>
          ),
      )}

      {windows.map(
        (window) =>
          window.isMinimized && (
            <Window
              key={window.id}
              title={window.title}
              icon={window.icon}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onFocus={() => bringToFront(window.id)}
              zIndex={window.zIndex}
              isMinimized={true}
            >
              {window.component}
            </Window>
          ),
      )}

      <Taskbar
        username={username}
        time={time}
        windows={windows.map((w) => ({
          id: w.id,
          title: w.title,
          icon: w.icon,
          isMinimized: w.isMinimized,
        }))}
        dockApps={allApps
          .filter((app) => app.showInDock && (!app.adminOnly || isAdminMode))
          .map((app) => ({ id: app.id, name: app.name, icon: app.icon }))}
        onWindowClick={toggleMinimize}
        onAppOpen={openApp}
        isAdminMode={isAdminMode}
      />

      {desktopContextMenu && (
        <div
          className="fixed bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-2xl py-1 min-w-[180px] z-[10000]"
          style={{ left: `${desktopContextMenu.x}px`, top: `${desktopContextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 flex items-center gap-2"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <div className="h-px bg-border/50 my-1" />
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 flex items-center gap-2"
            onClick={() => {
              openApp("settings")
              setDesktopContextMenu(null)
            }}
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </button>
          <div className="h-px bg-border/50 my-1" />
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-destructive/50 text-destructive flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}

      {alert && (
        <AlertDialog type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert(null)} />
      )}
    </div>
  )
}
