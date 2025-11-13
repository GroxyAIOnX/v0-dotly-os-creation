"use client"

import { useState } from "react"
import LockScreen from "@/components/lock-screen"
import Desktop from "@/components/desktop"
import BootSequence from "@/components/boot-sequence"

export default function DotlyOS() {
  const [bootComplete, setBootComplete] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")

  const handleBootComplete = (user: string) => {
    setBootComplete(true)
    if (user === "Guest") {
      setUsername(user)
      setIsLoggedIn(true)
    } else {
      // For Admin, show lock screen
      setUsername("")
      setIsLoggedIn(false)
    }
  }

  const handleLogin = (user: string) => {
    setUsername(user)
    setIsLoggedIn(true)
  }

  return (
    <main className="h-screen w-screen overflow-hidden font-sans">
      {!bootComplete ? (
        <BootSequence onBootComplete={handleBootComplete} />
      ) : !isLoggedIn ? (
        <LockScreen onLogin={handleLogin} />
      ) : (
        <Desktop username={username} />
      )}
    </main>
  )
}
