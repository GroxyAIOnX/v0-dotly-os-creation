"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Monitor, Wifi, Volume2, Bell, Palette, Trash2, User, Upload, Lock, AlertCircle } from 'lucide-react'
import { getAccount, saveAccount, clearAccountData } from "@/lib/storage"
import { playErrorSound } from "@/lib/sounds"
import Image from "next/image"

interface SettingsProps {
  username?: string
  onShowAlert?: (alert: { type: "error" | "warning" | "info" | "success"; title: string; message: string }) => void
}

export default function Settings({ username, onShowAlert }: SettingsProps) {
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    wifi: true,
    bluetooth: false,
  })
  const [avatar, setAvatar] = useState<string>("/admin-avatar.png")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordNotification, setShowPasswordNotification] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (username) {
      const account = getAccount(username)
      if (account) {
        setSettings(account.settings)
        setAvatar(account.avatar || "/admin-avatar.png")
        if (!account.hasPassword) {
          setShowPasswordNotification(true)
        }
      }
    }
  }, [username])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !username) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setAvatar(result)

      const account = getAccount(username)
      if (account) {
        account.avatar = result
        saveAccount(account)
      }
    }
    reader.readAsDataURL(file)
  }

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)

    if (username) {
      const account = getAccount(username)
      if (account) {
        account.settings = newSettings
        saveAccount(account)
      }
    }
  }

  const handleClearData = () => {
    if (!username) return

    if (onShowAlert) {
      onShowAlert({
        type: "warning",
        title: "Security Warning",
        message: `This will permanently delete all data for ${username}. This action cannot be undone. Click OK to confirm.`,
      })

      playErrorSound()

      setTimeout(() => {
        clearAccountData(username)
        if (onShowAlert) {
          onShowAlert({
            type: "success",
            title: "Data Cleared",
            message: "All user data has been successfully cleared.",
          })
        }
      }, 3000)
    }
  }

  const handleCreatePassword = () => {
    if (!username) return
    
    if (password.length < 4) {
      onShowAlert?.({
        type: "error",
        title: "Invalid Password",
        message: "Password must be at least 4 characters long.",
      })
      return
    }

    if (password !== confirmPassword) {
      onShowAlert?.({
        type: "error",
        title: "Password Mismatch",
        message: "Passwords do not match. Please try again.",
      })
      return
    }

    const account = getAccount(username)
    if (account) {
      account.password = password
      account.hasPassword = true
      saveAccount(account)
      setShowPasswordNotification(false)
      setPassword("")
      setConfirmPassword("")
      
      onShowAlert?.({
        type: "success",
        title: "Password Created",
        message: "Your password has been successfully created. You will need it to sign in next time.",
      })
    }
  }

  const settingsSections = [
    {
      title: "Display",
      icon: <Monitor className="h-5 w-5" />,
      items: [
        { label: "Brightness", value: "80%" },
        { label: "Resolution", value: "1920x1080" },
      ],
    },
    {
      title: "Network",
      icon: <Wifi className="h-5 w-5" />,
      items: [
        { label: "Wi-Fi", value: settings.wifi, toggle: () => toggleSetting("wifi") },
        { label: "Bluetooth", value: settings.bluetooth, toggle: () => toggleSetting("bluetooth") },
      ],
    },
    {
      title: "Sound",
      icon: <Volume2 className="h-5 w-5" />,
      items: [
        { label: "System Sound", value: settings.sound, toggle: () => toggleSetting("sound") },
        { label: "Volume", value: "60%" },
      ],
    },
    {
      title: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      items: [
        { label: "Show Notifications", value: settings.notifications, toggle: () => toggleSetting("notifications") },
      ],
    },
  ]

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Settings</h2>

        <div className="space-y-6">
          {showPasswordNotification && (
            <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">Security Update Required</h4>
                <p className="text-sm text-muted-foreground">
                  Your account was created before the password update. Please create a password below to secure your account.
                </p>
              </div>
            </div>
          )}

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-primary">
                <User className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-foreground">Profile</h3>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-muted border-2 border-border overflow-hidden flex-shrink-0">
                <Image
                  src={avatar || "/placeholder.svg"}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-3">Change your profile picture</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="bg-transparent"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-primary">
                <Lock className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-foreground">Security</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {showPasswordNotification ? "Create Password" : "Change Password"}
                </label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleCreatePassword} className="w-full">
                {showPasswordNotification ? "Create Password" : "Update Password"}
              </Button>
            </div>
          </div>

          {settingsSections.map((section, index) => (
            <div key={index} className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-primary">{section.icon}</span>
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
              </div>

              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">{item.label}</span>
                    {typeof item.value === "boolean" ? (
                      <Switch checked={item.value} onCheckedChange={item.toggle} />
                    ) : (
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-primary">
                <Palette className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Customize Theme
            </Button>
          </div>

          <div className="bg-destructive/10 rounded-lg border border-destructive/50 p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-destructive">
                <Trash2 className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete all data for this account. This action cannot be undone.
            </p>
            <Button onClick={handleClearData} variant="destructive" className="w-full">
              Clear All Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
