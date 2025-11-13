"use client"

import type React from "react"
import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface LauncherProps {
  apps: Array<{
    id: string
    name: string
    icon: React.ReactNode
    adminOnly?: boolean
  }>
  onAppOpen: (appId: string) => void
  isAdminMode?: boolean
}

export default function Launcher({ apps, onAppOpen, isAdminMode = false }: LauncherProps) {
  const [search, setSearch] = useState("")

  const filteredApps = apps
    .filter((app) => !app.adminOnly || isAdminMode)
    .filter((app) => app.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="h-full flex flex-col bg-background/95 backdrop-blur-xl">
      {/* Search Bar */}
      <div className="p-6 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50 focus-visible:ring-accent"
            autoFocus
          />
        </div>
      </div>

      {/* Apps Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredApps.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                onAppOpen(app.id)
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 hover:bg-card/60 hover:border-accent/50 transition-all group"
            >
              <div className="text-accent group-hover:scale-110 transition-transform">{app.icon}</div>
              <span className="text-sm text-foreground text-center leading-tight">{app.name}</span>
            </button>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No applications found</p>
          </div>
        )}
      </div>
    </div>
  )
}
