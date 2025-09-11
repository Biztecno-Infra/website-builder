"use client"

import { useEffect } from "react"

interface KeyboardShortcutsProps {
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export const useKeyboardShortcuts = ({ onUndo, onRedo, canUndo, canRedo }: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field or textarea
      const target = event.target as HTMLElement
      const isInputField = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable

      // Don't trigger shortcuts when typing in input fields
      if (isInputField) return

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey

      if (ctrlKey && !event.shiftKey && event.key.toLowerCase() === "z" && canUndo) {
        event.preventDefault()
        onUndo()
      } else if (
        (ctrlKey && event.shiftKey && event.key.toLowerCase() === "z") ||
        (ctrlKey && event.key.toLowerCase() === "y")
      ) {
        if (canRedo) {
          event.preventDefault()
          onRedo()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onUndo, onRedo, canUndo, canRedo])
}
