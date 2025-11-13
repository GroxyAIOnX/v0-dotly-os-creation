"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

interface LockScreenProps {
  onLogin: (username: string) => void
}

export default function LockScreen({ onLogin }: LockScreenProps) {
  const [username, setUsername] = useState("")
  const [time, setTime] = useState(new Date())

  // Update time every second
  useState(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onLogin(username.trim())
    }
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

  return (
    <div className="h-full w-full bg-gradient-to-br from-violet-600 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-teal-500/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.3),transparent_50%)]" />

      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Time Display */}
        <div className="text-center">
          <h1 className="font-mono text-8xl font-bold text-white mb-2 tracking-tight drop-shadow-2xl">
            {formattedTime}
          </h1>
          <p className="text-2xl text-white/90 drop-shadow-lg">{formattedDate}</p>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm">
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
              <h2 className="text-2xl font-semibold text-white mb-2">Admin</h2>
              <p className="text-sm text-white/80">Enter username to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 rounded-xl focus:bg-white/25 focus:border-white/50"
                autoFocus
              />
              <Button
                type="submit"
                className="w-full h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl shadow-lg border border-white/30"
                disabled={!username.trim()}
              >
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="text-xs text-center text-white/70 mt-6">No password required • System Account</p>
          </div>
        </div>
      </div>
    </div>
  )
}
