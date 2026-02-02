"use client"

import { useRef, useState, useCallback, useEffect, type KeyboardEvent, type ClipboardEvent } from "react"
import { Clipboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: boolean
  className?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  // Split value into individual digits
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length)

  // Focus first empty input on mount
  useEffect(() => {
    const firstEmptyIndex = digits.findIndex((d) => !d)
    if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
      inputRefs.current[firstEmptyIndex]?.focus()
    }
  }, [])

  // Handle input change
  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (disabled) return

      // Only accept digits
      const cleanDigit = digit.replace(/\D/g, "").slice(-1)

      // Update value
      const newDigits = [...digits]
      newDigits[index] = cleanDigit
      const newValue = newDigits.join("").slice(0, length)
      onChange(newValue)

      // Move to next input if we have a digit
      if (cleanDigit && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }

      // Check if complete
      if (newValue.length === length && onComplete) {
        onComplete(newValue)
      }
    },
    [digits, length, onChange, onComplete, disabled]
  )

  // Handle key down
  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      switch (e.key) {
        case "Backspace":
          e.preventDefault()
          if (digits[index]) {
            // Clear current input
            handleChange(index, "")
          } else if (index > 0) {
            // Move to previous input and clear it
            inputRefs.current[index - 1]?.focus()
            handleChange(index - 1, "")
          }
          break
        case "ArrowLeft":
          e.preventDefault()
          if (index > 0) {
            inputRefs.current[index - 1]?.focus()
          }
          break
        case "ArrowRight":
          e.preventDefault()
          if (index < length - 1) {
            inputRefs.current[index + 1]?.focus()
          }
          break
        case "Delete":
          e.preventDefault()
          handleChange(index, "")
          break
      }
    },
    [digits, length, handleChange, disabled]
  )

  // Handle paste
  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return

      e.preventDefault()
      const pastedData = e.clipboardData.getData("text")
      const digits = pastedData.replace(/\D/g, "").slice(0, length)

      if (digits) {
        onChange(digits)
        // Focus the next empty input or the last one
        const nextIndex = Math.min(digits.length, length - 1)
        inputRefs.current[nextIndex]?.focus()

        if (digits.length === length && onComplete) {
          onComplete(digits)
        }
      }
    },
    [length, onChange, onComplete, disabled]
  )

  // Handle paste from clipboard button
  const handlePasteFromClipboard = useCallback(async () => {
    if (disabled) return

    try {
      const text = await navigator.clipboard.readText()
      const digits = text.replace(/\D/g, "").slice(0, length)

      if (digits) {
        onChange(digits)
        if (digits.length === length && onComplete) {
          onComplete(digits)
        }
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err)
    }
  }, [length, onChange, onComplete, disabled])

  return (
    <div className={cn("space-y-4", className)}>
      {/* OTP Inputs */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            disabled={disabled}
            className={cn(
              "w-11 h-14 sm:w-14 sm:h-16 text-center text-xl font-semibold rounded-lg border-2 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : focusedIndex === index
                  ? "border-primary focus:ring-primary"
                  : "border-gray-200 focus:border-primary focus:ring-primary",
              disabled && "bg-gray-100 cursor-not-allowed"
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Paste from clipboard button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePasteFromClipboard}
          disabled={disabled}
          className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-2"
        >
          <Clipboard className="w-4 h-4" />
          Paste from clipboard
        </Button>
      </div>
    </div>
  )
}
