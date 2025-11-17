"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Shield, X, Minimize2 } from 'lucide-react'
import Image from "next/image"

interface TaskbarProps {
  username: string
  time: Date
  windows: Array<{
    id: string
    title: string
    icon: React.ReactNode
    isMinimized: boolean
  }>
  dockApps: Array<{
    id: string
    name: string
    icon: React.ReactNode
  }>
  onWindowClick: (id: string) => void
  onAppOpen: (appId: string) => void
  isAdminMode: boolean
}

export default function Taskbar({
  username,
  time,
  windows,
  dockApps,
  onWindowClick,
  onAppOpen,
  isAdminMode,
}: TaskbarProps) {
  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; windowId: string } | null>(null)

  const handleContextMenu = (e: React.MouseEvent, windowId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, windowId })
  }

  const handleCloseMenu = () => {
    setContextMenu(null)
  }

  // Cleanup event listener on unmount
  React.useEffect(() => {
    if (contextMenu) {
      document.addEventListener("click", handleCloseMenu)
      return () => {
        document.removeEventListener("click", handleCloseMenu)
      }
    }
  }, [contextMenu])

  return (
    <>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-card/40 backdrop-blur-2xl border border-border/30 rounded-full shadow-2xl flex items-center px-3 py-2 gap-2">
          <div className="flex items-center gap-1">
            {dockApps.map((app) => {
              const isOpen = windows.some((w) => w.id === app.id)
              const window = windows.find((w) => w.id === app.id)

              return (
                <Button
                  key={app.id}
                  variant="ghost"
                  onClick={() => (isOpen ? onWindowClick(app.id) : onAppOpen(app.id))}
                  onContextMenu={(e) => isOpen && handleContextMenu(e, app.id)}
                  className={`h-12 w-12 rounded-full hover:bg-secondary/50 flex items-center justify-center transition-all relative ${
                    isOpen && !window?.isMinimized ? "bg-secondary/60 backdrop-blur-sm" : ""
                  }`}
                  title={app.name}
                >
                  <span className="text-accent">{app.icon}</span>
                  {isOpen && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></span>
                  )}
                </Button>
              )
            })}
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-border/50" />

          {/* System Tray */}
          <div className="flex items-center gap-3 px-2">
            {isAdminMode && (
              <div className="flex items-center gap-1 text-destructive">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-semibold">ADMIN</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
                <Image
                  src="/admin-avatar.png"
                  alt="Admin"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-white font-medium">{username}</span>
            </div>
            <span className="text-sm font-mono text-white">{formattedTime}</span>
          </div>
        </div>
      </div>

      {contextMenu && (
        <div
          className="fixed bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-2xl py-1 min-w-[140px] z-[10001]"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 flex items-center gap-2"
            onClick={() => {
              onWindowClick(contextMenu.windowId)
              setContextMenu(null)
            }}
          >
            <Minimize2 className="h-4 w-4" />
            Restore
          </button>
          <div className="h-px bg-border/50 my-1" />
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-destructive/50 text-destructive flex items-center gap-2"
            onClick={() => {
              const closeButton = document.querySelector(`[data-window-id="${contextMenu.windowId}"]`)
              if (closeButton) (closeButton as HTMLElement).click()
              setContextMenu(null)
            }}
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
      )}
    </>
  )
}
