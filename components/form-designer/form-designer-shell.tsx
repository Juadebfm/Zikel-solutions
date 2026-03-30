"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  FileText,
  Shield,
  Wrench,
  Eye,
} from "lucide-react"

import { useFormDetail } from "@/hooks/api/use-forms"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FormDesignerShellProps {
  formId: string | null
  onBack: () => void
}

const STEPS = [
  { number: 1, title: "Details", icon: FileText },
  { number: 2, title: "Access", icon: Shield },
  { number: 3, title: "Build", icon: Wrench },
  { number: 4, title: "Preview", icon: Eye },
] as const

export function FormDesignerShell({ formId, onBack }: FormDesignerShellProps) {
  const [currentStep, setCurrentStep] = useState(1)

  const { data: formDetail, isLoading } = useFormDetail(formId ?? "", formId !== null)

  if (formId !== null && isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((step, index) => {
          const isCompleted = step.number < currentStep
          const isActive = step.number === currentStep
          const isUpcoming = step.number > currentStep

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isCompleted && "border-green-500 bg-green-500 text-white",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    isUpcoming && "border-muted-foreground/30 bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive && "text-primary",
                    isCompleted && "text-green-600",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-3 mt-[-1.25rem] h-0.5 w-16",
                    step.number < currentStep ? "bg-green-500" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                Form details editor will go here
              </p>
              {formDetail?.title && (
                <Badge variant="secondary" className="text-sm">
                  {formDetail.title}
                </Badge>
              )}
            </div>
          )}
          {currentStep === 2 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                Access & approval rules will go here
              </p>
            </div>
          )}
          {currentStep === 3 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                Form builder will go here
              </p>
            </div>
          )}
          {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Eye className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                Form preview will go here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
          )}

          {currentStep < 4 && (
            <Button onClick={() => setCurrentStep((s) => s + 1)}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}

          {currentStep === 4 && (
            <Button>
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
