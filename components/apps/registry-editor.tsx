"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ChevronRight, ChevronDown, FolderClosed, FolderOpen, Key, Search, Shield, AlertTriangle } from "lucide-react"

interface RegistryKey {
  name: string
  type: "folder" | "value"
  value?: string
  children?: RegistryKey[]
  isOpen?: boolean
}

export default function RegistryEditor() {
  const [selectedPath, setSelectedPath] = useState("HKEY_LOCAL_MACHINE\\SOFTWARE\\dotlyOS")
  const [searchQuery, setSearchQuery] = useState("")

  const [registry, setRegistry] = useState<RegistryKey[]>([
    {
      name: "HKEY_LOCAL_MACHINE",
      type: "folder",
      isOpen: true,
      children: [
        {
          name: "SOFTWARE",
          type: "folder",
          isOpen: true,
          children: [
            {
              name: "dotlyOS",
              type: "folder",
              isOpen: true,
              children: [
                { name: "Version", type: "value", value: "2.1.0" },
                { name: "InstallDate", type: "value", value: "2025-01-15" },
                { name: "AdminMode", type: "value", value: "Enabled" },
                { name: "SecureBootKey", type: "value", value: "0xFA8C12E3D4B7A9F2" },
              ],
            },
            {
              name: "SystemConfig",
              type: "folder",
              children: [
                { name: "BootTimeout", type: "value", value: "5" },
                { name: "FastBoot", type: "value", value: "true" },
                { name: "MainDrive", type: "value", value: "DOTLY-OS-MAIN" },
              ],
            },
          ],
        },
        {
          name: "SYSTEM",
          type: "folder",
          children: [
            {
              name: "CurrentControlSet",
              type: "folder",
              children: [
                { name: "Control", type: "value", value: "SystemMode" },
                { name: "Services", type: "value", value: "Running" },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "HKEY_CURRENT_USER",
      type: "folder",
      children: [
        {
          name: "Software",
          type: "folder",
          children: [
            { name: "Username", type: "value", value: "Admin" },
            { name: "Theme", type: "value", value: "Dark" },
          ],
        },
      ],
    },
  ])

  const toggleFolder = (path: string[]) => {
    const updateRegistry = (items: RegistryKey[], currentPath: string[]): RegistryKey[] => {
      return items.map((item) => {
        if (currentPath.length === 1 && item.name === currentPath[0]) {
          return { ...item, isOpen: !item.isOpen }
        } else if (item.children && currentPath.length > 1 && item.name === currentPath[0]) {
          return { ...item, children: updateRegistry(item.children, currentPath.slice(1)) }
        }
        return item
      })
    }
    setRegistry(updateRegistry(registry, path))
  }

  const renderTree = (items: RegistryKey[], path: string[] = []) => {
    return items.map((item) => {
      const currentPath = [...path, item.name]
      const isFolder = item.type === "folder"

      return (
        <div key={currentPath.join("\\")}>
          <div
            className="flex items-center gap-2 px-2 py-1 hover:bg-secondary/50 cursor-pointer rounded text-sm"
            onClick={() => {
              if (isFolder) {
                toggleFolder(currentPath)
                setSelectedPath(currentPath.join("\\"))
              }
            }}
          >
            {isFolder ? (
              <>
                {item.isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {item.isOpen ? (
                  <FolderOpen className="h-4 w-4 text-yellow-500" />
                ) : (
                  <FolderClosed className="h-4 w-4 text-yellow-500" />
                )}
              </>
            ) : (
              <>
                <div className="w-3" />
                <Key className="h-3 w-3 text-blue-400" />
              </>
            )}
            <span className={isFolder ? "font-medium" : ""}>{item.name}</span>
          </div>
          {isFolder && item.isOpen && item.children && (
            <div className="ml-4 border-l border-border/30 pl-2">{renderTree(item.children, currentPath)}</div>
          )}
        </div>
      )
    })
  }

  const getSelectedValues = () => {
    const findValues = (items: RegistryKey[], path: string[]): RegistryKey[] => {
      if (path.length === 0) return []

      for (const item of items) {
        if (item.name === path[0]) {
          if (path.length === 1 && item.children) {
            return item.children.filter((child) => child.type === "value")
          } else if (item.children && path.length > 1) {
            return findValues(item.children, path.slice(1))
          }
        }
      }
      return []
    }

    return findValues(registry, selectedPath.split("\\"))
  }

  return (
    <div className="h-full bg-background/95 backdrop-blur-sm text-foreground flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 p-4 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-destructive" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Registry Editor</h2>
            <p className="text-xs text-muted-foreground">View and modify system registry</p>
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search registry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-background/50 border-border/30 text-sm h-8"
            />
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-destructive/10 border-b border-destructive/30 p-2 flex items-center gap-2 text-xs">
        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
        <span className="text-destructive font-semibold">ADMIN MODE:</span>
        <span className="text-muted-foreground">Editing registry values can affect MAIN DRIVE system stability</span>
      </div>

      {/* Address Bar */}
      <div className="border-b border-border/50 p-2 bg-background/30">
        <Input
          value={selectedPath}
          onChange={(e) => setSelectedPath(e.target.value)}
          className="bg-background/50 border-border/30 text-xs font-mono h-8"
        />
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Tree View */}
        <div className="w-1/2 border-r border-border/50 overflow-y-auto p-3 bg-card/20">
          <div className="space-y-1">{renderTree(registry)}</div>
        </div>

        {/* Values Panel */}
        <div className="w-1/2 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Registry Values</h3>
            <div className="space-y-2">
              {getSelectedValues().map((value) => (
                <div key={value.name} className="bg-card/30 backdrop-blur-sm border border-border/30 rounded p-3">
                  <div className="flex items-start gap-3">
                    <Key className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">{value.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">REG_SZ</p>
                      <div className="mt-2">
                        <Input
                          value={value.value}
                          readOnly
                          className="bg-background/50 border-border/30 text-xs font-mono h-7"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {getSelectedValues().length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">No values in selected key</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-border/50 p-2 bg-card/20 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Registry Editor - MAIN DRIVE Target</span>
        <span className="text-muted-foreground">Admin Access: Enabled</span>
      </div>
    </div>
  )
}
