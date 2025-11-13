"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Shield, HardDrive, Cpu, Settings, Power, AlertTriangle } from "lucide-react"

export default function BootManager() {
  const [bootOrder, setBootOrder] = useState([
    { id: 1, name: "MAIN DRIVE (dotlyOS)", priority: 1, enabled: true, type: "System" },
    { id: 2, name: "USB Device", priority: 2, enabled: true, type: "External" },
    { id: 3, name: "Network Boot", priority: 3, enabled: false, type: "Network" },
    { id: 4, name: "Recovery Partition", priority: 4, enabled: true, type: "Recovery" },
  ])

  const [bootSettings, setBootSettings] = useState({
    fastBoot: true,
    secureBootEnabled: true,
    bootTimeout: 5,
    uefiMode: true,
  })

  return (
    <div className="h-full bg-background/95 backdrop-blur-sm text-foreground flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 p-4 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-destructive" />
          <div>
            <h2 className="text-lg font-semibold">Boot Manager</h2>
            <p className="text-xs text-muted-foreground">Manage system boot configuration</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Warning Banner */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-destructive">ADMIN ACCESS REQUIRED</p>
            <p className="text-muted-foreground">Changes to boot configuration affect MAIN DRIVE only.</p>
          </div>
        </div>

        {/* Boot Order */}
        <div className="bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Boot Order Configuration
          </h3>
          <div className="space-y-2">
            {bootOrder.map((device) => (
              <div
                key={device.id}
                className="bg-background/50 border border-border/30 rounded p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded">
                    #{device.priority}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{device.name}</p>
                    <p className="text-xs text-muted-foreground">{device.type}</p>
                  </div>
                </div>
                <Button
                  variant={device.enabled ? "default" : "secondary"}
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    setBootOrder((prev) => prev.map((d) => (d.id === device.id ? { ...d, enabled: !d.enabled } : d)))
                  }
                >
                  {device.enabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Boot Settings */}
        <div className="bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Boot Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Fast Boot</p>
                <p className="text-xs text-muted-foreground">Skip hardware checks on startup</p>
              </div>
              <Button
                variant={bootSettings.fastBoot ? "default" : "outline"}
                size="sm"
                onClick={() => setBootSettings({ ...bootSettings, fastBoot: !bootSettings.fastBoot })}
              >
                {bootSettings.fastBoot ? "ON" : "OFF"}
              </Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Secure Boot</p>
                <p className="text-xs text-muted-foreground">Prevent unauthorized OS loading</p>
              </div>
              <Button
                variant={bootSettings.secureBootEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setBootSettings({ ...bootSettings, secureBootEnabled: !bootSettings.secureBootEnabled })}
              >
                {bootSettings.secureBootEnabled ? "ON" : "OFF"}
              </Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">UEFI Mode</p>
                <p className="text-xs text-muted-foreground">Use modern boot interface</p>
              </div>
              <Button
                variant={bootSettings.uefiMode ? "default" : "outline"}
                size="sm"
                onClick={() => setBootSettings({ ...bootSettings, uefiMode: !bootSettings.uefiMode })}
              >
                {bootSettings.uefiMode ? "UEFI" : "Legacy"}
              </Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Boot Timeout</p>
                <p className="text-xs text-muted-foreground">Seconds before default boot</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setBootSettings({ ...bootSettings, bootTimeout: Math.max(0, bootSettings.bootTimeout - 1) })
                  }
                >
                  -
                </Button>
                <span className="text-sm font-mono w-8 text-center">{bootSettings.bootTimeout}s</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setBootSettings({ ...bootSettings, bootTimeout: Math.min(30, bootSettings.bootTimeout + 1) })
                  }
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            System Information
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">BIOS Version:</span>
              <span>dotlyOS v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Boot Type:</span>
              <span>{bootSettings.uefiMode ? "UEFI" : "Legacy BIOS"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Secure Boot:</span>
              <span className={bootSettings.secureBootEnabled ? "text-green-500" : "text-red-500"}>
                {bootSettings.secureBootEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Main Drive:</span>
              <span>DOTLY-OS-MAIN (256GB)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="default" className="flex-1 flex items-center gap-2">
            <Power className="h-4 w-4" />
            Apply & Restart
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  )
}
