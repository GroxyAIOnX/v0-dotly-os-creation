"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function Calculator() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? digit : display + digit)
    }
  }

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".")
    }
  }

  const clear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = Number.parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+":
        return a + b
      case "-":
        return a - b
      case "×":
        return a * b
      case "÷":
        return a / b
      case "%":
        return a % b
      default:
        return b
    }
  }

  const buttons = [
    ["C", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ]

  const handleButtonClick = (value: string) => {
    switch (value) {
      case "C":
        clear()
        break
      case ".":
        inputDot()
        break
      case "=":
        performOperation("=")
        break
      case "+":
      case "-":
      case "×":
      case "÷":
      case "%":
        performOperation(value)
        break
      default:
        inputDigit(value)
    }
  }

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Display */}
        <div className="bg-secondary rounded-lg p-6 mb-4 border border-border">
          <div className="text-right">
            {operation && previousValue !== null && (
              <div className="text-sm text-muted-foreground mb-1">
                {previousValue} {operation}
              </div>
            )}
            <div className="text-4xl font-mono font-bold text-foreground truncate">{display}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          {buttons.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-2">
              {row.map((btn) => (
                <Button
                  key={btn}
                  onClick={() => handleButtonClick(btn)}
                  className={`h-14 text-lg font-semibold ${
                    btn === "="
                      ? "col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                      : btn === "C"
                        ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        : ["+", "-", "×", "÷", "%"].includes(btn)
                          ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}
                  variant="outline"
                >
                  {btn}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
