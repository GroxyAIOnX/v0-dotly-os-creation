"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Monitor, Wifi, Volume2, Bell, Palette, Trash2 } from 'lucide-react'
import { getAccount, saveAccount, clearAccountData } from "@/lib/storage"
import { playErrorSound } from "@/lib/sounds"

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

  useEffect(() => {
    if (username) {
      const account = getAccount(username)
      if (account) {
        setSettings(account.settings)
      }
    }
  }, [username])

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
      // Show confirmation alert
      onShowAlert({
        type: "warning",
        title: "Security Warning",
        message: `This will permanently delete all data for ${username}. This action cannot be undone. Click OK to confirm.`,
      })

      // Play error sound
      playErrorSound()

      // Clear data after a delay to allow user to see the alert
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
