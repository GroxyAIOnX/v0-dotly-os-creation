"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Save, Trash2, FileCode, Package } from 'lucide-react'
import { getAccount, saveAccount } from "@/lib/storage"

interface ImportHtmlProps {
  username?: string
  onOpenDrxInstaller?: (appName: string, appHtml: string) => void
}

export default function ImportHtml({ username, onOpenDrxInstaller }: ImportHtmlProps) {
  const [htmlContent, setHtmlContent] = useState("")
  const [appName, setAppName] = useState("")
  const [savedApps, setSavedApps] = useState<Array<{ id: string; name: string; html: string }>>([])
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useState(() => {
    if (username) {
      const account = getAccount(username)
      if (account?.savedHtmlApps) {
        setSavedApps(account.savedHtmlApps)
      }
    }
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setHtmlContent(content)
      setAppName(file.name.replace(".html", ""))
    }
    reader.readAsText(file)
  }

  const handleSave = () => {
    if (!appName.trim() || !htmlContent.trim() || !username) return

    // Open installer for .drx compilation
    if (onOpenDrxInstaller) {
      onOpenDrxInstaller(appName, htmlContent)
      // Reset form
      setHtmlContent("")
      setAppName("")
    }
  }

  const handleDelete = (id: string) => {
    const updatedApps = savedApps.filter((app) => app.id !== id)
    setSavedApps(updatedApps)

    // Update user account
    if (username) {
      const account = getAccount(username)
      if (account) {
        account.savedHtmlApps = updatedApps
        saveAccount(account)
      }
    }

    if (selectedApp === id) {
      setSelectedApp(null)
    }
  }

  const handleOpenApp = (id: string) => {
    setSelectedApp(id)
  }

  const selectedAppData = savedApps.find((app) => app.id === selectedApp)

  return (
    <div className="h-full flex flex-col">
      {!selectedApp ? (
        <>
          {/* Upload and Editor Section */}
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Import HTML</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">App Name</label>
                <Input
                  type="text"
                  placeholder="Enter app name"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".html,.htm"
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload HTML File
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">HTML Content</label>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Paste your HTML code here..."
                  className="w-full h-64 p-3 rounded-md border border-border bg-background text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary overflow-y-auto"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={!appName.trim() || !htmlContent.trim()}
                className="w-full"
              >
                <Package className="mr-2 h-4 w-4" />
                Compile to .drx
              </Button>
            </div>
          </div>

          {/* Saved Apps Section */}
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Installed Apps (.drx)</h3>

            {savedApps.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No installed apps yet</p>
                <p className="text-sm">Compile an HTML file to .drx to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedApps.map((app) => (
                  <div key={app.id} className="bg-card rounded-lg border border-border p-4 hover:border-primary transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-semibold text-foreground">{app.name}</h4>
                          <p className="text-xs text-muted-foreground">{app.name}.drx</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDelete(app.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={() => handleOpenApp(app.id)} variant="outline" className="w-full" size="sm">
                      Open App
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="h-full flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-semibold text-foreground">{selectedAppData?.name}</h3>
            <Button onClick={() => setSelectedApp(null)} variant="outline" size="sm">
              Close
            </Button>
          </div>
          <div className="flex-1 bg-white overflow-auto">
            <iframe
              srcDoc={selectedAppData?.html}
              className="w-full h-full min-h-full border-0"
              title={selectedAppData?.name}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  )
}
