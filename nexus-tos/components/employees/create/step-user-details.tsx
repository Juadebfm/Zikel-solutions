"use client"

import { useCreateEmployeeStore } from "@/stores/create-employee-store"
import { Info } from "lucide-react"

export function StepUserDetails() {
  const { userDetails, updateUserDetails } = useCreateEmployeeStore()

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Set Corresponding User Record
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={userDetails.setCorrespondingUserRecord}
          onClick={() =>
            updateUserDetails(
              "setCorrespondingUserRecord",
              !userDetails.setCorrespondingUserRecord
            )
          }
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            userDetails.setCorrespondingUserRecord ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              userDetails.setCorrespondingUserRecord ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">User Record Information</p>
          <p>
            When enabled, a corresponding user record will be automatically created for this
            employee. This allows the employee to log into the system with their own
            credentials. The user record will be linked to this employee profile.
          </p>
        </div>
      </div>
    </div>
  )
}
