"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Plus, ArrowLeft } from "lucide-react"
import Image from "next/image"
import {
  getAllAccounts,
  type UserAccount,
  setSelectedAccount,
  getSelectedAccount,
  clearSelectedAccount,
} from "@/lib/storage"
import LockScreenTerminal from "./lock-screen-terminal"

interface LockScreenProps {
  onLogin: (username: string) => void
}

export default function LockScreen({ onLogin }: LockScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [time, setTime] = useState(new Date())
  const [accounts, setAccounts] = useState<UserAccount[]>([])
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [selectedAccount, setSelectedAccountState] = useState<string | null>(null)
  const [showPasswordScreen, setShowPasswordScreen] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)

  useEffect(() => {
    const loadedAccounts = getAllAccounts()
    setAccounts(loadedAccounts)

    const saved = getSelectedAccount()
    if (saved) {
      const account = loadedAccounts.find((a) => a.username === saved)
      if (account) {
        setSelectedAccountState(saved)
        setUsername(saved)
        setShowPasswordScreen(true)
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault()
        setShowTerminal((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      clearSelectedAccount()
      onLogin(username.trim())
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    clearSelectedAccount()
    onLogin(username)
  }

  const handleSelectAccount = (accountName: string) => {
    setSelectedAccountState(accountName)
    setUsername(accountName)
    setSelectedAccount(accountName)
    setShowPasswordScreen(true)
  }

  const handleBackToAccounts = () => {
    setShowPasswordScreen(false)
    setSelectedAccountState(null)
    setPassword("")
    clearSelectedAccount()
  }

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const selectedAccountData = showPasswordScreen ? accounts.find((a) => a.username === username) : null

  return (
    <div className="h-full w-full bg-gradient-to-br from-violet-600 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-teal-500/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.3),transparent_50%)]" />

      <div className="relative z-10 flex flex-col items-center gap-12">
        <div className="text-center">
          <h1 className="font-mono text-8xl font-bold text-white mb-2 tracking-tight drop-shadow-2xl">
            {formattedTime}
          </h1>
          <p className="text-2xl text-white/90 drop-shadow-lg">{formattedDate}</p>
        </div>

        <div className="w-full max-w-sm">
          {showPasswordScreen && selectedAccountData ? (
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mb-4 border-2 border-white/30 overflow-hidden">
                  <Image
                    src={selectedAccountData.avatar || "/admin-avatar.png"}
                    alt={selectedAccountData.username}
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">{selectedAccountData.username}</h2>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white/20 backdrop-blur-2xl border-white/30 text-white placeholder:text-white/60 rounded-full focus:bg-white/25 focus:border-white/50"
                  autoFocus
                />
                <Button
                  type="submit"
                  className="w-full h-12 bg-white/20 backdrop-blur-2xl hover:bg-white/30 text-white rounded-full shadow-lg border border-white/30"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <Button
                onClick={handleBackToAccounts}
                variant="ghost"
                className="w-full mt-4 text-white hover:text-white hover:bg-white/10 rounded-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <p className="text-xs text-center text-white/70 mt-6">No password required • Press Enter</p>
            </div>
          ) : !isCreatingAccount && accounts.length > 0 ? (
            <div className="space-y-4">
              {accounts.map((account) => (
                <button
                  key={account.username}
                  onClick={() => handleSelectAccount(account.username)}
                  className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/15 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden flex-shrink-0">
                      <Image
                        src={account.avatar || "/admin-avatar.png"}
                        alt={account.username}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-semibold text-white">{account.username}</h2>
                      <p className="text-sm text-white/70">Click to sign in</p>
                    </div>
                  </div>
                </button>
              ))}

              <button
                onClick={() => setIsCreatingAccount(true)}
                className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/15 transition-all"
              >
                <div className="flex items-center justify-center gap-3 text-white">
                  <Plus className="w-6 h-6" />
                  <span className="font-semibold">Create New Account</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mb-4 border-2 border-white/30 overflow-hidden">
                  <Image
                    src="/admin-avatar.png"
                    alt="Admin Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {isCreatingAccount ? "Create Account" : "Admin"}
                </h2>
                <p className="text-sm text-white/80">Enter username to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 bg-white/20 backdrop-blur-2xl border-white/30 text-white placeholder:text-white/60 rounded-xl focus:bg-white/25 focus:border-white/50"
                  autoFocus
                />
                <Button
                  type="submit"
                  className="w-full h-12 bg-white/20 backdrop-blur-2xl hover:bg-white/30 text-white rounded-xl shadow-lg border border-white/30"
                  disabled={!username.trim()}
                >
                  {isCreatingAccount ? "Create Account" : "Sign In"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {isCreatingAccount && accounts.length > 0 && (
                <Button
                  onClick={() => setIsCreatingAccount(false)}
                  variant="ghost"
                  className="w-full mt-4 text-white hover:text-white hover:bg-white/10"
                >
                  Back to Accounts
                </Button>
              )}

              <p className="text-xs text-center text-white/70 mt-6">No password required • System Account</p>
            </div>
          )}
        </div>
      </div>

      {showTerminal && <LockScreenTerminal onClose={() => setShowTerminal(false)} />}
    </div>
  )
}
