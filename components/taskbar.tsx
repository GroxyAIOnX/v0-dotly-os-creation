"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
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

  return (
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
  )
}
