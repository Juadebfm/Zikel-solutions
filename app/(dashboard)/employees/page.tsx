"use client"

import { useState } from "react"
import { EmployeesTab } from "@/components/employees/employees-tab"
import { EmpSettingsTab } from "@/components/employees/emp-settings-tab"
import { EmpAuditTab } from "@/components/employees/emp-audit-tab"

type MainTab = "employees" | "settings" | "audit"

const mainTabs: { key: MainTab; label: string }[] = [
  { key: "employees", label: "Employees" },
  { key: "audit", label: "Audit" },
  { key: "settings", label: "Settings" },
]

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("employees")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="text-gray-500 mt-1">
          View and manage employee records and assignments.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap">
        {mainTabs.map((tab, index) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            } ${index === 0 ? "rounded-l-lg" : ""} ${index === mainTabs.length - 1 ? "rounded-r-lg" : ""} ${index !== 0 ? "-ml-px" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        {activeTab === "employees" && <EmployeesTab />}
        {activeTab === "settings" && <EmpSettingsTab />}
        {activeTab === "audit" && <EmpAuditTab />}
      </div>
    </div>
  )
}
