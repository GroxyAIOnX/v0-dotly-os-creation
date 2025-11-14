"use client"

import { useState, useEffect } from "react"
import LockScreen from "@/components/lock-screen"
import Desktop from "@/components/desktop"
import BootSequence from "@/components/boot-sequence"
import { getAccount, createDefaultAccount, saveAccount, setCurrentUser } from "@/lib/storage"

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
      setUsername("")
      setIsLoggedIn(false)
    }
  }

  const handleLogin = (user: string) => {
    let account = getAccount(user)

    // Create account if it doesn't exist
    if (!account) {
      account = createDefaultAccount(user)
      saveAccount(account)
    }

    setCurrentUser(user)
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
