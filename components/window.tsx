"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Minus, Maximize2 } from "lucide-react"

interface WindowProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  onClose: () => void
  onMinimize: () => void
  onFocus: () => void
  zIndex: number
}

export default function Window({ title, icon, children, onClose, onMinimize, onFocus, zIndex }: WindowProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".window-controls")) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
    onFocus()
  }

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

  useState(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  })

  return (
    <div
      className="absolute bg-card/70 backdrop-blur-2xl border border-border/40 rounded-xl shadow-2xl overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex,
        maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 120px)",
      }}
      onClick={onFocus}
    >
      {/* Title Bar */}
      <div
        className="h-10 bg-secondary/40 backdrop-blur-sm border-b border-border/40 flex items-center justify-between px-4 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className="text-accent">{icon}</span>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1 window-controls">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50" onClick={onMinimize}>
            <Minus className="h-4 w-4 text-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50">
            <Maximize2 className="h-4 w-4 text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-destructive hover:text-destructive-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-2.5rem)] overflow-auto bg-background/50 backdrop-blur-sm">{children}</div>
    </div>
  )
}
