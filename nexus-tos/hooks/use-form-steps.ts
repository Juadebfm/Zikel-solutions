"use client"

import { useState, useCallback, useMemo } from "react"

interface UseFormStepsOptions<T> {
  totalSteps: number
  initialData: T
  onStepChange?: (step: number, direction: "next" | "prev") => void
}

interface UseFormStepsReturn<T> {
  currentStep: number
  totalSteps: number
  data: T
  updateData: (partial: Partial<T>) => void
  setStepData: <K extends keyof T>(step: K, stepData: T[K]) => void
  nextStep: () => boolean
  prevStep: () => boolean
  goToStep: (step: number) => boolean
  isFirstStep: boolean
  isLastStep: boolean
  reset: () => void
  progress: number
}

/**
 * Hook for managing multi-step form state and navigation
 *
 * @example
 * const {
 *   currentStep,
 *   data,
 *   updateData,
 *   nextStep,
 *   prevStep,
 *   isLastStep
 * } = useFormSteps({
 *   totalSteps: 4,
 *   initialData: {
 *     step1: { country: null },
 *     step2: { firstName: '', email: '' },
 *     step3: { password: '' },
 *     step4: { code: '' }
 *   }
 * })
 */
export function useFormSteps<T extends object>({
  totalSteps,
  initialData,
  onStepChange,
}: UseFormStepsOptions<T>): UseFormStepsReturn<T> {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<T>(initialData)

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps
  const progress = Math.round((currentStep / totalSteps) * 100)

  const updateData = useCallback((partial: Partial<T>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  const setStepData = useCallback(
    <K extends keyof T>(step: K, stepData: T[K]) => {
      setData((prev) => ({ ...prev, [step]: stepData }))
    },
    []
  )

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      onStepChange?.(newStep, "next")
      return true
    }
    return false
  }, [currentStep, totalSteps, onStepChange])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      onStepChange?.(newStep, "prev")
      return true
    }
    return false
  }, [currentStep, onStepChange])

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        const direction = step > currentStep ? "next" : "prev"
        setCurrentStep(step)
        onStepChange?.(step, direction)
        return true
      }
      return false
    },
    [totalSteps, currentStep, onStepChange]
  )

  const reset = useCallback(() => {
    setCurrentStep(1)
    setData(initialData)
  }, [initialData])

  return useMemo(
    () => ({
      currentStep,
      totalSteps,
      data,
      updateData,
      setStepData,
      nextStep,
      prevStep,
      goToStep,
      isFirstStep,
      isLastStep,
      reset,
      progress,
    }),
    [
      currentStep,
      totalSteps,
      data,
      updateData,
      setStepData,
      nextStep,
      prevStep,
      goToStep,
      isFirstStep,
      isLastStep,
      reset,
      progress,
    ]
  )
}

export default useFormSteps
