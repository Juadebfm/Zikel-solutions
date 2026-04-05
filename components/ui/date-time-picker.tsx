"use client"

import { CalendarDays, Clock3 } from "lucide-react"
import { format, startOfDay } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  disabledPast?: boolean
  className?: string
}

type Meridiem = "AM" | "PM"

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => padTwo(index + 1))
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => padTwo(index))

function padTwo(value: number): string {
  return String(value).padStart(2, "0")
}

export function toLocalDateTimeValue(date: Date): string {
  return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}T${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`
}

export function parseLocalDateTimeValue(value: string): Date | null {
  if (!value) return null

  const [datePart, timePart] = value.split("T")
  if (!datePart || !timePart) return null

  const [year, month, day] = datePart.split("-").map((chunk) => Number(chunk))
  const [hour, minute] = timePart.split(":").map((chunk) => Number(chunk))

  if ([year, month, day, hour, minute].some((chunk) => Number.isNaN(chunk))) {
    return null
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0)
}

function to24Hour(hour12: number, period: Meridiem): number {
  if (period === "AM") {
    return hour12 === 12 ? 0 : hour12
  }

  return hour12 === 12 ? 12 : hour12 + 12
}

function to12HourParts(date: Date): { hour: string; minute: string; period: Meridiem } {
  const hour24 = date.getHours()
  const period: Meridiem = hour24 >= 12 ? "PM" : "AM"
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12

  return {
    hour: padTwo(hour12),
    minute: padTwo(date.getMinutes()),
    period,
  }
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled = false,
  disabledPast = false,
  className,
}: DateTimePickerProps) {
  const now = new Date()
  const selectedDateTime = parseLocalDateTimeValue(value)
  const selectedDate = selectedDateTime ?? undefined
  const baseDateTime = selectedDateTime ?? now
  const { hour: selectedHour, minute: selectedMinute, period: selectedPeriod } =
    to12HourParts(baseDateTime)
  const minDate = startOfDay(now)

  const triggerLabel = selectedDateTime
    ? format(selectedDateTime, "dd MMM yyyy, HH:mm")
    : placeholder

  function clampPast(dateTime: Date): Date {
    if (disabledPast && dateTime.getTime() < now.getTime()) {
      return now
    }
    return dateTime
  }

  function handleDateChange(nextDate: Date | undefined) {
    if (!nextDate) {
      onChange("")
      return
    }

    const base = selectedDateTime ?? now
    const nextDateTime = new Date(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      nextDate.getDate(),
      base.getHours(),
      base.getMinutes(),
      0,
      0
    )

    onChange(toLocalDateTimeValue(clampPast(nextDateTime)))
  }

  function updateTime(hour: string, minute: string, period: Meridiem) {
    const hourNumber = Number(hour)
    const minuteNumber = Number(minute)
    if (Number.isNaN(hourNumber) || Number.isNaN(minuteNumber)) return

    const base = selectedDateTime ?? now
    const nextDateTime = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      to24Hour(hourNumber, period),
      minuteNumber,
      0,
      0
    )

    onChange(toLocalDateTimeValue(clampPast(nextDateTime)))
  }

  function handleHourChange(hour: string) {
    if (!hour) return
    updateTime(hour, selectedMinute, selectedPeriod)
  }

  function handleMinuteChange(minute: string) {
    if (!minute) return
    updateTime(selectedHour, minute, selectedPeriod)
  }

  function handlePeriodChange(period: string) {
    if (period !== "AM" && period !== "PM") return
    updateTime(selectedHour, selectedMinute, period)
  }

  function handleSetNow() {
    onChange(toLocalDateTimeValue(now))
  }

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start gap-2 font-normal",
              !selectedDateTime && "text-muted-foreground",
              className
            )}
          >
            <CalendarDays className="h-4 w-4" />
            {triggerLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <div className="space-y-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              disabled={disabledPast ? { before: minDate } : undefined}
              captionLayout="dropdown"
            />
            {disabledPast ? (
              <p className="text-xs text-muted-foreground">
                Pick today or a future date. Past dates are not allowed.
              </p>
            ) : null}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                Time
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={selectedHour} onValueChange={handleHourChange} disabled={disabled}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUR_OPTIONS.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMinute} onValueChange={handleMinuteChange} disabled={disabled}>
                  <SelectTrigger>
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTE_OPTIONS.map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={handlePeriodChange} disabled={disabled}>
                  <SelectTrigger>
                    <SelectValue placeholder="AM/PM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!value}
                onClick={() => onChange("")}
              >
                Clear
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleSetNow}>
                Set now
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
