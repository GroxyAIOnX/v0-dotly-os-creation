"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Monitor, Wifi, Volume2, Bell, Lock, Palette } from "lucide-react"

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    wifi: true,
    bluetooth: false,
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
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

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-primary">
                <Lock className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-foreground">Security</h3>
            </div>
            <Button variant="outline" className="w-full mb-2 bg-transparent">
              Change Password
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Privacy Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
