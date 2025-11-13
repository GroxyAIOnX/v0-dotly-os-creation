"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, Folder, FileText, AlertTriangle, Shield, Edit, Trash2 } from "lucide-react"
import AlertDialog from "@/components/alert-dialog"

interface FileNode {
  name: string
  type: "file" | "folder"
  content?: string
  children?: FileNode[]
  isSystem?: boolean
  isUnreadable?: boolean
}

const fileSystem: FileNode = {
  name: "root",
  type: "folder",
  children: [
    {
      name: "Documents",
      type: "folder",
      children: [
        { name: "welcome.txt", type: "file", content: "Welcome to dotlyOS!" },
        { name: "readme.md", type: "file", content: "# dotlyOS\n\nA modern operating system." },
      ],
    },
    {
      name: "Downloads",
      type: "folder",
      children: [],
    },
    {
      name: "systems",
      type: "folder",
      isSystem: true,
      children: [
        {
          name: "system.d",
          type: "folder",
          isSystem: true,
          children: [
            {
              name: "dotlyOS",
              type: "folder",
              isSystem: true,
              children: [
                {
                  name: "kernel.sys",
                  type: "file",
                  isSystem: true,
                  content: "KERNEL_VERSION=1.0.0\nBOOT_LOADER=GRUB2\nINIT_SYSTEM=systemd",
                },
                {
                  name: "boot.cfg",
                  type: "file",
                  isSystem: true,
                  content: "timeout=5\ndefault=dotlyOS\nquiet splash",
                },
                {
                  name: "core",
                  type: "folder",
                  isSystem: true,
                  children: [
                    {
                      name: "init.d",
                      type: "file",
                      isSystem: true,
                      content: "#!/bin/bash\n# Init daemon startup script\nstart_services()",
                    },
                    {
                      name: "services.sys",
                      type: "file",
                      isSystem: true,
                      content: "SERVICE_LIST=network,audio,display\nAUTO_START=true",
                    },
                    {
                      name: "security",
                      type: "folder",
                      isSystem: true,
                      children: [
                        {
                          name: "auth.sys",
                          type: "file",
                          isSystem: true,
                          content: "AUTH_METHOD=password\nSESSION_TIMEOUT=3600\nMAX_ATTEMPTS=3",
                        },
                        {
                          name: ".note",
                          type: "file",
                          isSystem: true,
                          isUnreadable: true,
                          content:
                            "SECURITY_PROTOCOL_ALPHA\n\nMAIN_DRIVE: /dev/sda1\nPARTITION_TABLE: GPT\nFILESYSTEM: ext4\n\n[ENCRYPTED_SECTION]\nKEY: ████████████████\nHASH: SHA256\nSALT: ████████\n\nWARNING: Modifications to MAIN_DRIVE can cause system instability.\nAll changes are logged and monitored.\n\nLast accessed: NEVER\nPermissions: ROOT_ONLY",
                        },
                        {
                          name: "firewall.cfg",
                          type: "file",
                          isSystem: true,
                          content: "FIREWALL_ENABLED=true\nDEFAULT_POLICY=deny\nALLOWED_PORTS=22,80,443",
                        },
                        {
                          name: ".note.backup",
                          type: "file",
                          isSystem: true,
                          isUnreadable: true,
                          content:
                            "BACKUP_PROTOCOL\n\n[CRITICAL_SYSTEM_DATA]\nBACKUP_TARGET: MAIN_DRIVE\nRESTORE_POINT: 2025-01-15\n\nEncryption Key Fragments:\nFRAG_1: ████████\nFRAG_2: ████████\nFRAG_3: ████████\n\nDO NOT MODIFY - CRITICAL SYSTEM COMPONENT",
                        },
                      ],
                    },
                    {
                      name: "drivers",
                      type: "folder",
                      isSystem: true,
                      children: [
                        {
                          name: "graphics.drv",
                          type: "file",
                          isSystem: true,
                          content: "GPU_DRIVER=mesa\nHARDWARE_ACCEL=enabled",
                        },
                        {
                          name: ".note.legacy",
                          type: "file",
                          isSystem: true,
                          isUnreadable: true,
                          content:
                            "LEGACY_DRIVER_MANIFEST\n\nCompatibility Layer: ACTIVE\nMAIN_DRIVE_DEPENDENCIES:\n- kernel_module.ko\n- system_bridge.so\n\n[WARNING] These drivers interface directly with MAIN_DRIVE hardware.\nRemoval will result in system failure.",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

interface FileManagerProps {
  isAdminMode?: boolean
  onOpenNote?: (name: string, content: string) => void
}

export default function FileManager({ isAdminMode = false, onOpenNote }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState<string[]>(["root"])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [alert, setAlert] = useState<{
    type: "error" | "warning" | "info" | "success"
    title: string
    message: string
  } | null>(null)

  const getCurrentFolder = (): FileNode => {
    let current = fileSystem
    for (let i = 1; i < currentPath.length; i++) {
      const folder = current.children?.find((c) => c.name === currentPath[i])
      if (folder && folder.type === "folder") {
        current = folder
      }
    }
    return current
  }

  const navigateToFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName])
    setSelectedFile(null)
  }

  const navigateUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1))
      setSelectedFile(null)
    }
  }

  const handleFileClick = (node: FileNode) => {
    if (node.type === "folder") {
      navigateToFolder(node.name)
    } else {
      if (node.isUnreadable) {
        if (isAdminMode && onOpenNote) {
          onOpenNote(node.name, node.content || "")
        } else {
          setAlert({
            type: "error",
            title: "Unreadable File",
            message: `The file "${node.name}" appears to be corrupted or encoded in an unknown format. Cannot display file contents.\n\nRequires ADMIN access to view.`,
          })
        }
        return
      }
      setSelectedFile(node)
    }
  }

  const handleDelete = (node: FileNode) => {
    if (node.isSystem && !isAdminMode) {
      setAlert({
        type: "error",
        title: "Security Warning",
        message: `Cannot delete "${node.name}". This is a protected system file and cannot be removed. This action is restricted to protect system integrity.\n\nRequires ADMIN access.`,
      })
    } else if (node.isSystem && isAdminMode) {
      setAlert({
        type: "warning",
        title: "Admin Mode: Delete System File",
        message: `You are about to delete "${node.name}" from the MAIN DRIVE. This operation will be logged and may affect system stability.\n\nContinue? (This is a simulation - file not actually deleted)`,
      })
    }
  }

  const currentFolder = getCurrentFolder()

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Bar */}
      <div className="bg-secondary p-4 border-b border-border flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateUp}
          disabled={currentPath.length === 1}
          className="text-foreground"
        >
          ←
        </Button>
        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-1 overflow-x-auto">
          {currentPath.map((path, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              <span className={index === currentPath.length - 1 ? "text-foreground font-medium" : ""}>{path}</span>
            </div>
          ))}
        </div>
        {isAdminMode && (
          <div className="flex items-center gap-1 text-destructive text-xs font-semibold">
            <Shield className="h-3 w-3" />
            ADMIN
          </div>
        )}
      </div>

      <div className="flex-1 flex">
        {/* File List */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {currentFolder.children?.map((node, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border border-border hover:bg-secondary cursor-pointer transition-colors ${
                  selectedFile === node ? "bg-secondary" : ""
                } ${node.isSystem ? "border-destructive/50" : ""}`}
                onClick={() => handleFileClick(node)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  handleDelete(node)
                }}
              >
                <div className="flex items-center gap-3">
                  {node.type === "folder" ? (
                    <Folder className={`h-5 w-5 ${node.isSystem ? "text-destructive" : "text-accent"}`} />
                  ) : (
                    <FileText className={`h-5 w-5 ${node.isSystem ? "text-destructive" : "text-primary"}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{node.name}</p>
                    {node.isSystem && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <Shield className="h-3 w-3" />
                        System
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {currentFolder.children?.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>This folder is empty</p>
            </div>
          )}
        </div>

        {/* File Preview */}
        {selectedFile && (
          <div className="w-80 bg-secondary border-l border-border p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {selectedFile.name}
            </h3>

            {selectedFile.isUnreadable ? (
              <div className="bg-background rounded-lg p-4 border border-destructive/50">
                <div className="flex items-center gap-2 text-destructive mb-3">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Unreadable File</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  This file appears to be corrupted or encoded in an unknown format.
                </p>
                <pre className="font-mono text-xs text-muted-foreground/50 overflow-x-auto whitespace-pre-wrap break-all">
                  {selectedFile.content}
                </pre>
              </div>
            ) : (
              <div className="bg-background rounded-lg p-4 font-mono text-xs text-foreground">
                <pre className="whitespace-pre-wrap break-words">{selectedFile.content || "No preview available"}</pre>
              </div>
            )}

            {selectedFile.isSystem && (
              <div className="mt-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full bg-transparent" disabled={!isAdminMode}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isAdminMode ? "Edit (Admin)" : "Edit (Locked)"}
                </Button>
                <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(selectedFile)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isAdminMode ? "Delete (Admin)" : "Delete (Locked)"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Windows-style alert dialog */}
      {alert && (
        <AlertDialog type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert(null)} />
      )}
    </div>
  )
}
