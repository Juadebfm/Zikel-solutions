"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getVehicleCustomInfoGroups } from "@/lib/mock-data"
import type { CustomFieldType } from "@/types"

interface CreateCustomInfoFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const fieldTypeGroups: { label: string; options: { value: CustomFieldType; label: string }[] }[] = [
  {
    label: "Date",
    options: [
      { value: "date-input", label: "Date Input" },
      { value: "time-input", label: "Time Input" },
    ],
  },
  {
    label: "Multi",
    options: [
      { value: "true-or-false", label: "True or False" },
      { value: "yes-or-no", label: "Yes or No" },
      { value: "checkbox-list", label: "CheckBox List" },
      { value: "dropdown-select-list", label: "Dropdown Select List" },
      { value: "radio-buttons", label: "Radio Buttons" },
    ],
  },
  {
    label: "Text",
    options: [
      { value: "numeric-input", label: "Numeric Input" },
      { value: "single-line-text-input", label: "Single Line Text Input" },
      { value: "multi-line-text-input", label: "Multi Line Text Input" },
    ],
  },
]

export function CreateCustomInfoFieldDialog({
  open,
  onOpenChange,
}: CreateCustomInfoFieldDialogProps) {
  const [fieldName, setFieldName] = useState("")
  const [description, setDescription] = useState("")
  const [required, setRequired] = useState(false)
  const [customGroup, setCustomGroup] = useState("")
  const [fieldType, setFieldType] = useState("")
  const [defaultValue, setDefaultValue] = useState("")

  const groups = getVehicleCustomInfoGroups()

  const handleSave = () => {
    console.log("Create custom info field:", {
      fieldName,
      description,
      required,
      customGroup,
      fieldType,
      defaultValue,
    })
    handleReset()
    onOpenChange(false)
  }

  const handleReset = () => {
    setFieldName("")
    setDescription("")
    setRequired(false)
    setCustomGroup("")
    setFieldType("")
    setDefaultValue("")
  }

  const handleBack = () => {
    handleReset()
    onOpenChange(false)
  }

  const isDateType = fieldType === "date-input" || fieldType === "time-input"
  const isTextType = fieldType === "numeric-input" || fieldType === "single-line-text-input" || fieldType === "multi-line-text-input"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create Custom Information Field
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Field Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fieldName" className="text-sm font-medium">
              Field Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fieldName"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder=""
              className="h-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=""
              className="min-h-20 resize-none"
            />
          </div>

          {/* Required field? */}
          <div className="flex items-center justify-between">
            <Label htmlFor="required" className="text-sm font-medium">
              Required field?
            </Label>
            <Switch
              id="required"
              checked={required}
              onCheckedChange={setRequired}
            />
          </div>

          {/* Custom Personal Group */}
          <div className="space-y-1.5">
            <Label htmlFor="customGroup" className="text-sm font-medium">
              Custom Personal Group <span className="text-red-500">*</span>
            </Label>
            <Select value={customGroup} onValueChange={setCustomGroup}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.name}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Field Type */}
          <div className="space-y-1.5">
            <Label htmlFor="fieldType" className="text-sm font-medium">
              Field Type <span className="text-red-500">*</span>
            </Label>
            <Select value={fieldType} onValueChange={(v) => { setFieldType(v); setDefaultValue("") }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select a field type" />
              </SelectTrigger>
              <SelectContent>
                {fieldTypeGroups.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.label}
                    </SelectLabel>
                    {group.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Value - dynamic based on field type */}
          <div className="space-y-1.5">
            <Label htmlFor="defaultValue" className="text-sm font-medium">
              Default value
            </Label>
            {isDateType ? (
              <Input
                id="defaultValue"
                type={fieldType === "date-input" ? "date" : "time"}
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                className="h-9"
              />
            ) : isTextType ? (
              fieldType === "multi-line-text-input" ? (
                <Textarea
                  id="defaultValue"
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder=""
                  className="min-h-20 resize-none"
                />
              ) : (
                <Input
                  id="defaultValue"
                  type={fieldType === "numeric-input" ? "number" : "text"}
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder=""
                  className="h-9"
                />
              )
            ) : (
              <Input
                id="defaultValue"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                placeholder=""
                className="h-9"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleBack}>
              <ArrowLeft className="size-3.5" />
              Back
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90"
              onClick={handleSave}
              disabled={!fieldName || !customGroup || !fieldType}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
