"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Trash2, Shield } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  timestamp: Date
  isSystemNote?: boolean
}

interface NotesProps {
  initialNote?: {
    name: string
    content: string
  }
}

export default function Notes({ initialNote }: NotesProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Welcome to dotlyOS",
      content: "This is your first note. Start typing to create more notes!",
      timestamp: new Date(),
    },
  ])
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0])
  const [editTitle, setEditTitle] = useState(notes[0].title)
  const [editContent, setEditContent] = useState(notes[0].content)

  useEffect(() => {
    if (initialNote) {
      const systemNote: Note = {
        id: `system-${Date.now()}`,
        title: initialNote.name,
        content: initialNote.content,
        timestamp: new Date(),
        isSystemNote: true,
      }
      setNotes((prev) => [systemNote, ...prev])
      setSelectedNote(systemNote)
      setEditTitle(systemNote.title)
      setEditContent(systemNote.content)
    }
  }, [initialNote])

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      timestamp: new Date(),
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setEditTitle(newNote.title)
    setEditContent(newNote.content)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
    }
  }

  const saveNote = () => {
    if (selectedNote) {
      setNotes(
        notes.map((n) =>
          n.id === selectedNote.id ? { ...n, title: editTitle, content: editContent, timestamp: new Date() } : n,
        ),
      )
    }
  }

  return (
    <div className="h-full flex">
      {/* Notes List */}
      <div className="w-64 bg-secondary border-r border-border overflow-y-auto">
        <div className="p-4 border-b border-border">
          <Button onClick={createNote} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        <div className="p-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => {
                setSelectedNote(note)
                setEditTitle(note.title)
                setEditContent(note.content)
              }}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                selectedNote?.id === note.id ? "bg-primary/20" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-start gap-2">
                <FileText
                  className={`h-4 w-4 mt-1 flex-shrink-0 ${note.isSystemNote ? "text-destructive" : "text-primary"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                  {note.isSystemNote && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <Shield className="h-3 w-3" />
                      System File
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{note.timestamp.toLocaleDateString()}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <div className="p-4 border-b border-border">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={saveNote}
                disabled={selectedNote.isSystemNote}
                className={`text-xl font-semibold bg-transparent border-none focus-visible:ring-0 px-0 ${selectedNote.isSystemNote ? "cursor-not-allowed opacity-70" : ""}`}
                placeholder="Note title"
              />
            </div>

            <div className="flex-1 p-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onBlur={saveNote}
                disabled={selectedNote.isSystemNote}
                className={`h-full resize-none bg-transparent border-none focus-visible:ring-0 text-foreground font-mono text-sm ${selectedNote.isSystemNote ? "cursor-not-allowed opacity-70" : ""}`}
                placeholder="Start typing..."
              />
            </div>

            <div className="p-4 border-t border-border flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {selectedNote.isSystemNote
                  ? "Read-only system file"
                  : `Last edited: ${selectedNote.timestamp.toLocaleString()}`}
              </span>
              <Button variant="destructive" size="sm" onClick={() => deleteNote(selectedNote.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                {selectedNote.isSystemNote ? "Close" : "Delete"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
