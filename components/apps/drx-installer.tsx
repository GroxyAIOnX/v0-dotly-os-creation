"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Package, HardDrive, Check } from 'lucide-react'

interface DrxInstallerProps {
  appName: string
  appHtml: string
  onInstall: (installed: boolean) => void
  onClose: () => void
}

export default function DrxInstaller({ appName, appHtml, onInstall, onClose }: DrxInstallerProps) {
  const [step, setStep] = useState<"welcome" | "installing" | "complete">("welcome")
  const [progress, setProgress] = useState(0)

  const handleInstall = () => {
    setStep("installing")
    let currentProgress = 0
    
    const interval = setInterval(() => {
      currentProgress += 5
      setProgress(currentProgress)
      
      if (currentProgress >= 100) {
        clearInterval(interval)
        setStep("complete")
      }
    }, 50)
  }

  const handleFinish = () => {
    onInstall(true)
    onClose()
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Windows-style installer header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-lg p-3">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{appName} Setup</h2>
            <p className="text-sm text-white/80">dotlyOS Application Installer</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 flex items-center justify-center">
        {step === "welcome" && (
          <div className="text-center max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="bg-primary/10 rounded-full p-6">
                <HardDrive className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Welcome to {appName} Setup Wizard
            </h3>
            <p className="text-muted-foreground mb-8">
              This will install {appName} on your computer. Click Install to continue or Cancel to exit Setup.
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-left">
              <p className="font-semibold mb-2">Installation Details:</p>
              <p className="text-muted-foreground">Destination: /Apps/{appName}.drx</p>
              <p className="text-muted-foreground">Space required: ~2 MB</p>
            </div>
          </div>
        )}

        {step === "installing" && (
          <div className="text-center max-w-md w-full">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4">Installing {appName}</h3>
            <p className="text-muted-foreground mb-6">Please wait while Setup installs {appName}...</p>
            <div className="bg-muted rounded-full h-4 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{progress}% Complete</p>
          </div>
        )}

        {step === "complete" && (
          <div className="text-center max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="bg-green-500/10 rounded-full p-6">
                <Check className="h-16 w-16 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Installation Complete</h3>
            <p className="text-muted-foreground mb-8">
              {appName} has been successfully installed on your computer. The application is now ready to use.
            </p>
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-sm">
              <p className="text-green-600 dark:text-green-400 font-semibold">
                You can now launch {appName} from your applications or taskbar.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Windows-style button bar */}
      <div className="border-t border-border p-4 bg-secondary/30 flex justify-end gap-3">
        {step === "welcome" && (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleInstall}>Install</Button>
          </>
        )}
        {step === "complete" && (
          <Button onClick={handleFinish}>Finish</Button>
        )}
      </div>
    </div>
  )
}
