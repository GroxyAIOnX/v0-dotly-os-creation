"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react'

interface WindowProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  onClose: () => void
  onMinimize: () => void
  onFocus: () => void
  zIndex: number
  isMinimized?: boolean
}

export default function Window({ title, icon, children, onClose, onMinimize, onFocus, zIndex, isMinimized = false }: WindowProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMaximized, setIsMaximized] = useState(false)
  const [prevDimensions, setPrevDimensions] = useState({ x: 100, y: 100, width: 800, height: 600 })
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [isOpening, setIsOpening] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsOpening(true)
    const timer = setTimeout(() => setIsOpening(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".window-controls")) return
    if (isMaximized) return
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

  const handleMaximize = () => {
    if (isMaximized) {
      // Restore
      setPosition({ x: prevDimensions.x, y: prevDimensions.y })
      setSize({ width: prevDimensions.width, height: prevDimensions.height })
      setIsMaximized(false)
    } else {
      setPrevDimensions({ x: position.x, y: position.y, width: size.width, height: size.height })
      setPosition({ x: 0, y: 0 })
      setSize({ width: window.innerWidth, height: window.innerHeight - 80 })
      setIsMaximized(true)
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
    onFocus()
  }

  const handleClickOutside = () => {
    if (contextMenu) {
      setContextMenu(null)
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  useEffect(() => {
    if (contextMenu) {
      document.addEventListener("click", handleClickOutside)
    }
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [contextMenu])

  return (
    <div
      ref={windowRef}
      className={`absolute bg-card/70 backdrop-blur-2xl border border-border/40 shadow-2xl overflow-hidden ${
        isMaximized ? 'rounded-none' : 'rounded-xl'
      }`}
      style={{
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 0 : position.y,
        width: isMaximized ? '100vw' : size.width,
        height: isMaximized ? 'calc(100vh - 80px)' : size.height,
        zIndex,
        transition: isClosing || isMinimized ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : isMaximized !== undefined ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        opacity: isOpening ? 0 : isClosing ? 0 : 1,
        transform: isOpening 
          ? 'scale(0.95) translateY(20px)' 
          : isClosing 
          ? 'scale(0.9) translateY(20px)' 
          : isMinimized 
          ? 'scale(0.3) translateY(100vh)' 
          : 'scale(1) translateY(0)',
      }}
      onClick={onFocus}
      onContextMenu={handleContextMenu}
    >
      {/* Title Bar */}
      <div
        className="h-10 bg-secondary/40 backdrop-blur-sm border-b border-border/40 flex items-center justify-between px-4 cursor-move select-none"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleMaximize}
      >
        <div className="flex items-center gap-2">
          <span className="text-accent">{icon}</span>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1 window-controls">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50" onClick={onMinimize}>
            <Minus className="h-4 w-4 text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted/50"
            onClick={handleMaximize}
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4 text-foreground" />
            ) : (
              <Maximize2 className="h-4 w-4 text-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-2.5rem)] overflow-auto bg-background/50 backdrop-blur-sm">{children}</div>

      {contextMenu && (
        <div
          className="fixed bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-2xl py-1 min-w-[180px] z-[10000]"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 flex items-center gap-2"
            onClick={() => {
              handleMaximize()
              setContextMenu(null)
            }}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isMaximized ? "Restore" : "Maximize"}
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 flex items-center gap-2"
            onClick={() => {
              onMinimize()
              setContextMenu(null)
            }}
          >
            <Minus className="h-4 w-4" />
            Minimize
          </button>
          <div className="h-px bg-border/50 my-1" />
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-destructive/50 text-destructive flex items-center gap-2"
            onClick={() => {
              handleClose()
              setContextMenu(null)
            }}
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
      )}
    </div>
  )
}
